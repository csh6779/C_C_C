from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials # 👈 여기가 중요!
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import re

import models, schemas
from database import engine, get_db

# DB 테이블 자동 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- 설정값 ---
SECRET_KEY = "my_super_secret_key"
ALGORITHM = "HS256"
ADMIN_SECRET_CODE = "1234"

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# 자물쇠 버튼을 "토큰만 넣는 방식"으로 설정
security = HTTPBearer()

# --- 인증 관련 함수들 ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 토큰 추출 방식
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials # 👈 토큰 값만 쏙 가져옴
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="자격 증명이 유효하지 않습니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# --- API 엔드포인트 ---

# 1. 회원가입
@app.post("/signup", status_code=201)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 이메일 형식 검사
    email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(email_regex, user.id):
        raise HTTPException(status_code=400, detail="아이디는 올바른 이메일 주소여야 합니다!")

    existing_user = db.query(models.User).filter(models.User.id == user.id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

    user_role = "user"
    if user.secret_key == ADMIN_SECRET_CODE:
        user_role = "admin"
    
    hashed_pw = get_password_hash(user.pw)
    new_user = models.User(id=user.id, name=user.name, password=hashed_pw, role=user_role)
    db.add(new_user)
    db.commit()
    return {"message": "회원가입 성공", "role": user_role}

# 2. 로그인
@app.post("/login", response_model=schemas.Token)
def login(user_input: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_input.id).first()
    if not user or not verify_password(user_input.pw, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="아이디/비밀번호 오류")

    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

# 3. 내 정보 조회 (로그인 필요)
@app.get("/users/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "role": current_user.role}

# 4. 회원 탈퇴 (메시지 추가됨!)
@app.delete("/users/me", status_code=200) # 👈 204(No Content) 대신 200(OK)으로 변경
def delete_me(
    user_input: schemas.UserDelete,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. 비밀번호 확인
    if not verify_password(user_input.password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="비밀번호가 일치하지 않아 탈퇴할 수 없습니다."
        )
    
    # 2. 삭제하기 전에 이름(닉네임)을 미리 저장해둠!
    deleted_user_name = current_user.name

    # 3. 삭제 실행
    db.delete(current_user)
    db.commit()
    
    # 4. 마지막 인사 메시지 전달
    return {"message": f"{deleted_user_name} 계정 영구 삭제가 완료되었습니다."}
from pydantic import BaseModel
from typing import Optional

# 회원가입할 때 받을 정보
class UserCreate(BaseModel):
    id: str
    pw: str
    name: str
    secret_key: Optional[str] = None # 관리자 가입 시에만 입력

# 로그인할 때 받을 정보
class UserLogin(BaseModel):
    id: str
    pw: str

# 토큰 줄 때 형색
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

# [NEW] 삭제할 때 비밀번호를 받기 위한 약속
class UserDelete(BaseModel):
    password: str
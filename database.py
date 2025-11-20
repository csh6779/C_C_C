from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 형식: mysql+pymysql://아이디:비밀번호@주소:포트/데이터베이스이름
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:1221@localhost:3306/teamcook_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# DB 세션을 가져오는 도구 (나중에 API에서 씀)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
from sqlalchemy import Column, String, Integer
from database import Base

class User(Base):
    __tablename__ = "users"

    # id는 유저가 입력하는 아이디 (Primary Key)
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(50))
    password = Column(String(200)) # 암호화된 비번이 들어감
    role = Column(String(10))      # "admin" 또는 "user"
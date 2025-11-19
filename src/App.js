import React, { useState, useEffect } from 'react'; 
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css'; 
import CommunityPage from './CommunityPage.js'; 
import VideoDetailPage from './VideoDetailPage.js'; 
import MyPage from './MyPage.js'; 
import LibraryPage from './ExerciseLibraryPage.js';
import DietPage from './DietPage.js';

// --- Mock Data 정의 (videoUrl 필드 추가) ---
const initialVideos = [
    { id: '1', title: '데드리프트 100kg 자세 피드백 부탁드립니다!', user: 'health_boy', feedbackCount: 8, views: 102, type: 'deadlift', createdAt: '2025-11-07T14:00:00Z', videoUrl: '/mock_deadlift.mp4' },
    { id: '2', title: '스쿼트 초보입니다. 무릎이 아파요 ㅠㅠ', user: 'beginner_kim', feedbackCount: 12, views: 150, type: 'squat', createdAt: '2025-11-07T13:00:00Z', videoUrl: '/mock_squat.mp4' },
    { id: '3', title: '벤치프레스 60kg, 가슴 자극이 안 와요', user: 'muscle_king', feedbackCount: 5, views: 88, type: 'benchpress', createdAt: '2025-11-06T10:00:00Z', videoUrl: '/mock_benchpress.mp4' },
    { id: '4', title: '오버헤드 프레스 자세 어떤가요?', user: 'shoulder_gant', feedbackCount: 7, views: 95, type: 'overheadpress', createdAt: '2025-11-05T15:00:00Z', videoUrl: '/mock_overheadpress.mp4' },
    { id: '5', title: '스쿼트 80kg 앉는 깊이 좀 봐주세요', user: 'squat_lover', feedbackCount: 15, views: 210, type: 'squat', createdAt: '2025-11-07T10:00:00Z', videoUrl: '/mock_squat2.mp4' },
    // 🚨 MyPage 테스트용 계정의 영상 추가 (닉네임: park)
    { id: '101', title: '나의 베스트 스쿼트 1RM 도전 영상', user: 'park', feedbackCount: 3, views: 45, type: 'squat', createdAt: '2025-11-08T09:00:00Z', videoUrl: '/mock_mypage_squat.mp4' },
    { id: '102', title: '루틴 챌린지 - 데드리프트 마지막 세트', user: 'park', feedbackCount: 1, views: 22, type: 'deadlift', createdAt: '2025-11-08T11:00:00Z', videoUrl: '/mock_mypage_deadlift.mp4' },
];

// --- 토스트 컴포넌트 (변경 없음) ---
function Toast({ message }) {
  return (
    <div className="toast-container">
      <div className="toast">
        {message}
      </div>
    </div>
  );
}

// --- 회원가입 모달 컴포넌트 (변경 없음) ---
function SignupModal({ onClose, onSwitchToLogin, addToast }) {
  const [Nickname, setNickname] = useState('');
  const [Email, setEmail] = useState(''); 

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!Nickname.trim() || !Email.trim()) {
        addToast('닉네임과 이메일을 모두 입력해주세요.');
        return;
    }
    
    localStorage.setItem('registeredNickname', Nickname);
    localStorage.setItem('registeredEmail', Email); 
    
    addToast(`회원가입 완료! 닉네임: ${Nickname}`);
    onClose();
    onSwitchToLogin(); 
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>회원가입</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <form onSubmit={handleSignupSubmit}>
          <div className="form-group">
            <label htmlFor="signup-email">이메일</label>
            <input 
              type="email" 
              id="signup-email" 
              required 
              value={Email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-password">비밀번호</label>
            <input type="password" id="signup-password" required minLength="6" />
          </div>
          <div className="form-group">
            <label htmlFor="signup-nickname">닉네임</label>
            <input 
              type="text" 
              id="signup-nickname" 
              required
              value={Nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <button type="submit" className="submit-button">가입하기</button>
        </form>
        <p className="modal-footer-text">
          이미 계정이 있으신가요?{' '}
          <button onClick={onSwitchToLogin} className="link-button">
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}

// --- 로그인 모달 컴포넌트 (변경 없음) ---
function LoginModal({ onClose, onSwitchToSignup, onLoginSuccess, addToast }) { 
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const storedNickname = localStorage.getItem('registeredNickname') || '비회원';
  const storedEmail = localStorage.getItem('registeredEmail') || '';

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      addToast('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    if (storedNickname === '비회원' || email !== storedEmail) { 
        // 🚨 데모 목적상 비밀번호는 무시하고 이메일만 체크
        addToast('이메일 정보가 일치하지 않거나 등록되지 않은 계정입니다.');
        return;
    }

    onLoginSuccess(storedNickname, storedEmail);
    onClose();
    addToast(`환영합니다, ${storedNickname}님!`);
    navigate('/community'); 
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>로그인</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">이메일</label>
            <input 
              type="email" 
              id="login-email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">비밀번호</label>
            <input 
              type="password" 
              id="login-password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="submit-button">로그인</button>
        </form>
        <p className="modal-footer-text">
          아직 계정이 없으신가요?{' '}
          <button onClick={onSwitchToSignup} className="link-button">
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}

// --- 헤더 컴포넌트 (변경 없음) ---
function Header({ onLoginClick, isLoggedIn, user, onLogout, addToast }) { 
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    addToast('성공적으로 로그아웃되었습니다.');
    navigate('/'); 
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>팀쿡</h1>
        </Link>
        <nav>
          <Link to="/community" style={{ color: 'white', textDecoration: 'none' }}>
            커뮤니티
          </Link>
          <Link to="/diet" style={{ color: 'white', textDecoration: 'none' }}>
            식단 추천
          </Link>
          <Link to="/library" style={{ color: 'white', textDecoration: 'none' }}>
            운동 라이브러리
          </Link>
          {isLoggedIn && (
            <Link to="/mypage" style={{ color: 'white', textDecoration: 'none' }}>
              마이페이지
            </Link>
          )}
        </nav>
        {isLoggedIn ? (
          <button onClick={handleLogout} className="header-login-button" style={{backgroundColor: '#ef4444'}}>
            {user.nickname}님, 로그아웃
          </button>
        ) : (
          <button onClick={onLoginClick} className="header-login-button">
            로그인
          </button>
        )}
      </div>
    </header>
  );
}

// --- LandingPage / Footer (변경 없음) ---
function LandingPage({ onLoginClick, onSignupClick, isLoggedIn }) {
  const style = {
    backgroundImage: "url(/background.jpg)", 
  };

  return (
    <main className="landing-page" style={style}>
      <div className="landing-overlay">
        <div className="landing-content">
          <h2>헬스커뮤니티에 오신 것을 환영합니다</h2>
          <p>전문가와 함께하는 피트니스 커뮤니티. 운동 영상을 공유하고 피드백을 받아보세요!</p>
          <div className="button-group">
            {!isLoggedIn && (
              <>
                <button onClick={onLoginClick} className="btn-primary">로그인</button>
                <button onClick={onSignupClick} className="btn-secondary">무료로 시작하기</button>
              </>
            )}
            {isLoggedIn && (<Link to="/community" className="btn-primary" style={{textDecoration: 'none'}}>커뮤니티 둘러보기</Link>)}
          </div>
        </div>
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand"><h3>헬스커뮤니티</h3><p>함께 성장하는 피트니스 커뮤니티</p></div>
        <div className="footer-links"><h4>링크</h4><ul><li><a href="#community">커뮤니티</a></li><li><a href="#diet">식단 추천</a></li><li><a href="#library">운동 라이브러리</a></li></ul></div>
        <div className="footer-info"><h4>정보</h4><ul><li><a href="#terms">이용 약관</a></li><li><a href="#privacy">개인정보 처리방침</a></li><li><a href="#support">고객 지원</a></li></ul></div>
        <div className="footer-contact"><h4>연락처</h4><p>text@naver.com</p><p>02-1234-5678</p></div>
      </div>
      <div className="footer-copyright"><p>© 2025 팀쿡. 클라우드 컴퓨팅 프로젝트</p></div>
    </footer>
  );
}


// 🚀 LocalStorage 동기화 함수
const syncVideosToLocalStorage = (videos) => {
    localStorage.setItem('community_videos', JSON.stringify(videos));
};

// --- 메인 App 컴포넌트 ---
export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ nickname: null, email: null });
  const [toasts, setToasts] = useState([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 
  
  // 🚀 전역 영상 목록 상태 (LocalStorage에서 불러오도록 수정)
  const [videos, setVideos] = useState(() => {
    const storedVideos = localStorage.getItem('community_videos');
    if (storedVideos) {
        return JSON.parse(storedVideos);
    }
    // LocalStorage에 없으면 초기 Mock 데이터 사용 및 저장
    syncVideosToLocalStorage(initialVideos);
    return initialVideos;
  }); 


  const addToast = (message) => {
    const newToast = { id: Date.now(), message };
    setToasts((prevToasts) => [newToast]); 

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== newToast.id));
    }, 3000);
  };

  // 컴포넌트 마운트 시 localStorage에서 로그인 상태 복원 (수정됨)
  useEffect(() => {
    const storedNickname = localStorage.getItem('userNickname');
    const storedEmail = localStorage.getItem('userEmail');

    if (storedNickname && storedEmail) {
        setIsLoggedIn(true);
        setUser({ nickname: storedNickname, email: storedEmail });
    }
    setIsLoadingAuth(false); 
  }, []);
  
  // 🚨 videos 상태가 변경될 때마다 LocalStorage에 저장
  useEffect(() => {
    syncVideosToLocalStorage(videos);
  }, [videos]);


  const handleShowLogin = () => { setShowSignup(false); setShowLogin(true); };
  const handleShowSignup = () => { setShowLogin(false); setShowSignup(true); };
  const handleCloseModals = () => { setShowLogin(false); setShowSignup(false); };
  
  const handleLoginSuccess = (nickname, email) => {
    setIsLoggedIn(true);
    setUser({ nickname, email });
    localStorage.setItem('userNickname', nickname); 
    localStorage.setItem('userEmail', email); 
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser({ nickname: null, email: null });
    localStorage.removeItem('userNickname'); 
    localStorage.removeItem('userEmail');
  };
  
  const handleUpdateProfile = (newNickname, newEmail) => {
      setUser(prevUser => ({ ...prevUser, nickname: newNickname, email: newEmail }));
      localStorage.setItem('userNickname', newNickname); 
      localStorage.setItem('userEmail', newEmail);
  };
  
  // 🚀 전역 영상 목록 추가 함수 (사용자 닉네임 저장 포함)
  const handleAddVideoToList = (title, type, userNickname) => {
      const newId = (Date.now()).toString();
      const newVideo = {
          id: newId,
          title: title,
          user: userNickname, // ✅ 사용자가 올린 영상의 닉네임 저장
          feedbackCount: 0,
          views: 0,
          type: type,
          createdAt: new Date().toISOString(),
          videoUrl: `/mock_new_upload_${newId}.mp4`, 
      };
      
      setVideos(prevVideos => [newVideo, ...prevVideos]);
      return newId;
  };
  
  // 🚀 전역 영상 목록 업데이트 함수 (제목만 업데이트)
  const handleUpdateVideoList = (videoId, newTitle) => {
      setVideos(prevVideos => 
          prevVideos.map(video => 
              video.id === videoId 
                  ? { ...video, title: newTitle } 
                  : video
          )
      );
  };
  
  // 🚀 전역 영상 삭제 함수
  const handleDeleteVideoFromList = (videoId) => {
      setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
  };


  return (
    <div className="app-container">
      {/* 토스트 메시지 렌더링 */}
      {toasts.map((toast) => ( <Toast key={toast.id} message={toast.message} /> ))}

      {/* 모달 */}
      {showLogin && ( <LoginModal onClose={handleCloseModals} onSwitchToSignup={handleShowSignup} onLoginSuccess={handleLoginSuccess} addToast={addToast} /> )}
      {showSignup && ( <SignupModal onClose={handleCloseModals} onSwitchToLogin={handleShowLogin} addToast={addToast} /> )}

      {/* 페이지 컨텐츠 */}
      <Header 
        onLoginClick={handleShowLogin}
        isLoggedIn={isLoggedIn} 
        user={user} 
        onLogout={handleLogout} 
        addToast={addToast} 
      />
      
      {/* 🚨 인증 로딩 중일 때 로딩 화면 표시 */}
      {isLoadingAuth ? (
          <main className="container" style={{padding: '5rem 0', textAlign: 'center', flexGrow: 1}}>
              <div className="spinner-container">
                {/* App.css에 정의된 스피너 클래스 */}
                <div className="spinner"></div> 
              </div>
              <p>인증 정보를 확인 중입니다...</p>
          </main>
      ) : (
          /* Routes와 Route로 페이지 정의 */
          <Routes>
            <Route path="/" element={<LandingPage onLoginClick={handleShowLogin} onSignupClick={handleShowSignup} isLoggedIn={isLoggedIn} />} />
            
            <Route 
              path="/community" 
              element={<CommunityPage 
                isLoggedIn={isLoggedIn} 
                onShowLogin={handleShowLogin} 
                addToast={addToast} 
                videos={videos} 
                onAddVideo={handleAddVideoToList} 
                user={user} // ✅ user 객체 전달
              />} 
            /> 
             <Route 
              path="/library" 
              element={<LibraryPage 
                isLoggedIn={isLoggedIn} 
                onShowLogin={handleShowLogin} 
                addToast={addToast} 
                videos={videos} 
                onAddVideo={handleAddVideoToList} 
                user={user} // ✅ user 객체 전달
              />} 
            /> 
            <Route 
              path="/diet" 
              element={<DietPage 
                isLoggedIn={isLoggedIn} 
                onShowLogin={handleShowLogin} 
                addToast={addToast} 
                videos={videos} 
                onAddVideo={handleAddVideoToList} 
                user={user} // ✅ user 객체 전달
              />} 
            /> 
            <Route 
              path="/video/:videoId" 
              element={<VideoDetailPage 
                isLoggedIn={isLoggedIn} 
                user={user} 
                addToast={addToast}
                videos={videos} 
                onVideoUpdated={handleUpdateVideoList} 
                onVideoDeleted={handleDeleteVideoFromList} 
              />} 
            />

            <Route 
              path="/mypage" 
              element={<MyPage 
                user={user} 
                isLoggedIn={isLoggedIn} 
                onLogout={handleLogout} 
                onUpdateProfile={handleUpdateProfile} 
                addToast={addToast} 
                videos={videos} // ✅ 전역 videos 상태 전달
              />} 
            />

            <Route path="*" element={<main className="container" style={{padding: '5rem 0', textAlign: 'center'}}><h2>404 - 페이지를 찾을 수 없습니다.</h2></main>} />
          </Routes>
      )}
      
      <Footer />
    </div>
  );
}
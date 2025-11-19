import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DietPage.css'; 

// --- 업로드 모달 컴포넌트 (user prop 추가) ---
function UploadModal({ onClose, addToast, onAddVideo, user }) { // ✅ user prop 추가
  const [title, setTitle] = useState('');
  const [type, setType] = useState('squat'); 
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !file) {
      addToast('영상 제목과 파일을 모두 선택해주세요.');
      return;
    }
    
    if (!user || !user.nickname) { // 로그인 상태 확인
        addToast('로그인 후 이용해주세요.');
        return;
    }

    setUploading(true);
    console.log('Uploading file:', file.name, 'with title:', title, 'Type:', type, 'by user:', user.nickname);

    setTimeout(() => {
      setUploading(false);
      
      // ✅ App.js의 전역 상태 업데이트 함수 호출 (사용자 닉네임 전달)
      const newVideoId = onAddVideo(title, type, user.nickname);
      
      addToast(`영상 업로드가 성공적으로 완료되었습니다!`);
      
      onClose();
      
    }, 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>내 운동 영상 업로드</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="video-title">영상 제목</label>
            <input
              type="text"
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 데드리프트 자세 피드백 부탁드립니다."
              disabled={uploading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="video-type">운동 분류</label>
            <select
              id="video-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="filter-select"
              style={{width: '100%', height: 'auto', padding: '0.75rem 1rem'}}
              disabled={uploading}
            >
              <option value="squat">스쿼트</option>
              <option value="benchpress">벤치프레스</option>
              <option value="deadlift">데드리프트</option>
              <option value="overheadpress">오버헤드 프레스</option>
              <option value="other">기타</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="video-file">영상 파일</label>
            <input
              type="file"
              id="video-file"
              accept="video/mp4,video/quicktime"
              onChange={handleFileChange}
              disabled={uploading}
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={uploading}>
            {uploading ? '업로드 중...' : '업로드하기'}
          </button>
        </form>
      </div>
    </div>
  );
}


// --- 메인 커뮤니티 페이지 컴포넌트 ---
function DietPage({ isLoggedIn, onShowLogin, addToast, videos, onAddVideo, user }) { // ✅ user prop 받음
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterType, setFilterType] = useState('all'); 
  const [sortOrder, setSortOrder] = useState('latest'); 
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate(); 
  
  const allVideos = videos; 

  // 로딩 상태 useEffect (변경 없음)
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false); 
    }, 1000); 
  }, []);

  // 검색, 필터, 정렬 로직 (🚨 useMemo 오류 수정 완료)
  const filteredVideos = useMemo(() => {
    let videos = [...allVideos]; // 지역 변수 videos 생성

    if (filterType !== 'all') {
      videos = videos.filter(video => video.type === filterType);
    }
    if (searchTerm) {
      videos = videos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortOrder === 'latest') {
      videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'popular') {
      videos.sort((a, b) => b.feedbackCount - a.feedbackCount);
    }

    return videos; // ✅ 지역 변수 videos를 반환
  }, [allVideos, searchTerm, filterType, sortOrder]);

  const handleCardClick = (videoId) => {
    navigate(`/video/${videoId}`); 
  };
  
  const handleUploadClick = () => {
    if (!isLoggedIn) {
      onShowLogin && onShowLogin();
      addToast('영상 업로드는 로그인 후 이용 가능합니다.');
    } else {
      setUploadModalOpen(true);
    }
  };


  return (
    <main className="diet-page-container container">
      <div className="page-header">
        <h2>식단 추천</h2>
        <p>자신의 식단을 공유하세요</p>
      </div>

      {/* --- 기능 툴바 (변경 없음) --- */}
      <div className="toolbar">
        <div className="search-filter-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="latest">최신순</option>
            <option value="popular">인기순 (피드백 많은 순)</option>
          </select>
        </div>
        <button 
          className="upload-button" 
          onClick={handleUploadClick}
          style={{opacity: isLoggedIn ? 1 : 0.6, cursor: isLoggedIn ? 'pointer' : 'not-allowed'}}
        >
          내 식단 올리기
        </button>
      </div>
      
      {/* --- 비디오 피드 --- */}
      <div className="video-feed">
        {isLoading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : filteredVideos.length > 0 ? (
          filteredVideos.map(video => (
            <div 
              key={video.id} 
              className="video-card" 
              onClick={() => handleCardClick(video.id)}
            >
              <div className="video-thumbnail">
                <span>[영상 썸네일: {video.type}]</span>
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                <div className="video-meta">
                  <span>by {video.user}</span>
                  <span>피드백 {video.feedbackCount}개 | 조회 {video.views}회</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">표시할 영상이 없습니다. 검색어나 필터를 확인해주세요.</p>
        )}
      </div>

      {/* --- 업로드 모달 --- */}
      {isUploadModalOpen && <UploadModal 
        onClose={() => setUploadModalOpen(false)} 
        addToast={addToast} 
        onAddVideo={onAddVideo}
        user={user} // ✅ user 객체 전달
      />}

    </main>
  );
}

export default DietPage;
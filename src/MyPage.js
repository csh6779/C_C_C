import React, { useState, useMemo } from 'react'; 
import { Navigate, useNavigate, Link } from 'react-router-dom'; 
// Modals.js에서 컴포넌트 import
import { 
    ConfirmDeleteModal, 
    EditVideoModal, 
    DeleteAccountModal 
} from './components/Modals'; 

// --- 프로필 수정 폼 컴포넌트 (변화 없음) ---
function ProfileEditForm({ user, onCancel, onSave, onUpdateProfile, addToast }) {
    const [nickname, setNickname] = useState(user.nickname || '');
    const [email] = useState(user.email); 

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!nickname.trim()) {
            addToast('닉네임을 입력해주세요.');
            return;
        }
        
        onUpdateProfile(nickname, email); 

        addToast('프로필 정보가 저장되었습니다.');
        onSave();
    };

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '2rem' }}>
            <h3 style={{marginTop: 0}}>프로필 수정</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="edit-nickname">닉네임</label>
                    <input 
                        type="text" 
                        id="edit-nickname" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)} 
                        placeholder="닉네임"
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>이메일</label>
                    <input 
                        type="email" 
                        value={email} 
                        disabled 
                        style={{ backgroundColor: '#f4f4f4' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" onClick={onCancel} className="upload-button" style={{backgroundColor: '#6b7280', width: 'auto'}}>
                        취소
                    </button>
                    <button type="submit" className="upload-button" style={{width: 'auto'}}>
                        저장
                    </button>
                </div>
            </form>
        </div>
    );
}

// --- 내 영상 목록 컴포넌트 (MyPage 내부에서 사용) ---
function VideoListSection({ myVideos, onVideoEdit, onVideoDelete, navigate }) {
    const handleCardClick = (videoId) => {
        navigate(`/video/${videoId}`);
    };

    return (
        <section style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
            <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid #2563eb', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>내 영상 목록</h2>
            
            {myVideos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #ddd', borderRadius: '8px', color: '#6b7280' }}>
                    <p>아직 등록한 영상이 없습니다. 커뮤니티에서 영상을 올려 피드백을 받아보세요!</p>
                    <Link to="/community" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                        영상 업로드 하러 가기 &rarr;
                    </Link>
                </div>
            ) : (
                <div className="video-feed" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {myVideos.map(video => (
                        <div 
                            key={video.id} 
                            className="video-card" 
                            style={{ 
                                padding: '1rem', 
                                border: '1px solid #ddd', 
                                borderRadius: '8px', 
                                transition: 'box-shadow 0.3s' 
                            }}
                        >
                            <div 
                                className="video-thumbnail" 
                                onClick={() => handleCardClick(video.id)}
                                style={{
                                    height: '150px', 
                                    backgroundColor: '#e0e7ff', 
                                    borderRadius: '6px', 
                                    marginBottom: '0.75rem', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={{ color: '#4f46e5' }}>[영상 썸네일: {video.type}]</span>
                            </div>
                            <h3 
                                onClick={() => handleCardClick(video.id)} 
                                style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                title={video.title}
                            >
                                {video.title}
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                                <span>피드백: {video.feedbackCount}개</span>
                                <div>
                                    <button 
                                        onClick={() => onVideoEdit(video)} 
                                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.875rem', padding: '0 0.5rem', textDecoration: 'underline' }}
                                    >
                                        수정
                                    </button>
                                    |
                                    <button 
                                        onClick={() => onVideoDelete(video)} 
                                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem', padding: '0 0.5rem', textDecoration: 'underline' }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

// --- 비밀번호 변경 폼 컴포넌트 (생략) ---
function PasswordChangeForm({ addToast }) { /* ... */ return (<div style={{ padding: '1.5rem 0', borderTop: '1px solid #eee', marginTop: '1.5rem' }}></div>); }


// --- 마이페이지 컴포넌트 (Hooks 위치 수정됨) ---
function MyPage({ user, isLoggedIn, onLogout, onUpdateProfile, addToast, videos }) { 
    // 🚨 Hooks를 조건부 리턴 이전에 최상단에 호출
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showVideoEditModal, setShowVideoEditModal] = useState(false);
    const [showVideoDeleteModal, setShowVideoDeleteModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // 🚀 useMemo를 사용하여 현재 사용자의 영상만 필터링
    const myVideos = useMemo(() => {
        if (!user || !user.nickname) return []; // user가 없으면 빈 배열 반환
        return videos.filter(video => video.user === user.nickname)
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [videos, user]); 


    // 🚨 조건부 리턴은 Hooks 호출 이후에 와야 함
    if (!isLoggedIn || !user) {
        addToast('로그인 후 마이페이지를 이용해주세요.');
        return <Navigate to="/" replace />;
    }


    // --- 영상 관리 핸들러 ---
    const handleVideoEdit = (video) => {
        setSelectedVideo(video);
        setShowVideoEditModal(true);
    };

    const handleVideoDelete = (video) => {
        setSelectedVideo(video);
        setShowVideoDeleteModal(true);
    };

    const handleVideoSave = (videoId, newTitle, newFile) => {
        addToast(`영상 ID: ${videoId}의 제목이 '${newTitle}'로 수정되었습니다.`);
        // TODO: App.js의 onUpdateVideoList 호출 로직 추가 필요
        setShowVideoEditModal(false);
        setSelectedVideo(null);
    };

    const handleVideoDeleteConfirm = () => {
        if (selectedVideo) {
            addToast(`${selectedVideo.title} 영상이 삭제되었습니다. (데모)`);
            // TODO: App.js의 onDeleteVideoFromList 호출 로직 추가 필요
            setShowVideoDeleteModal(false);
            setSelectedVideo(null);
        }
    };
    
    // --- 계정 관리 핸들러 ---
    const handleAccountDelete = () => {
        onLogout(); 
    };
    
    const handleProfileSave = () => {
        setIsEditing(false); // 수정 모드 종료
    };


    return (
        <main className="container" style={{padding: '3rem 0', flexGrow: 1}}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
                {user.nickname}님의 마이페이지
            </h1>

            {/* 1. 프로필 섹션 */}
            <section style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
                <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid #2563eb', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>프로필 정보</h2>
                
                {!isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ margin: 0 }}><strong>닉네임:</strong> {user.nickname}</p>
                        <p style={{ margin: 0 }}><strong>이메일:</strong> {user.email}</p>
                        <button 
                            className="upload-button"
                            style={{ width: 'auto', alignSelf: 'flex-start', marginTop: '1rem' }}
                            onClick={() => setIsEditing(true)}
                        >
                            프로필 수정
                        </button>
                    </div>
                ) : (
                    <>
                        <ProfileEditForm 
                            user={user} 
                            onCancel={() => setIsEditing(false)} 
                            onSave={handleProfileSave} 
                            onUpdateProfile={onUpdateProfile} 
                            addToast={addToast}
                        />
                         <PasswordChangeForm addToast={addToast} />
                    </>
                )}
            </section>

            {/* 2. 내 영상 목록 섹션 (필터링된 myVideos 사용) */}
            <VideoListSection 
                myVideos={myVideos} 
                onVideoEdit={handleVideoEdit} 
                onVideoDelete={handleVideoDelete} 
                navigate={navigate}
            />

            {/* 3. 계정 설정 섹션 */}
            <div style={{ 
                backgroundColor: '#ffe5e5', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                border: '1px solid #f87171',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{margin: 0, color: '#dc2626'}}>계정 탈퇴</h3>
                <button 
                    className="upload-button"
                    style={{backgroundColor: '#dc2626', width: 'auto'}}
                    onClick={() => setShowDeleteModal(true)}
                >
                    계정 영구 삭제
                </button>
            </div>

            {/* --- 공통 모달 렌더링 --- */}
            {showDeleteModal && (
                <DeleteAccountModal 
                    onClose={() => setShowDeleteModal(false)} 
                    user={user}
                    onAccountDelete={handleAccountDelete}
                    addToast={addToast}
                />
            )}
            
            {/* 영상 수정 모달 */}
            {showVideoEditModal && selectedVideo && (
                <EditVideoModal
                    onClose={() => setShowVideoEditModal(false)}
                    video={selectedVideo}
                    onSave={handleVideoSave} // 임시 핸들러
                    addToast={addToast}
                />
            )}
            
            {/* 영상 삭제 확인 모달 */}
            {showVideoDeleteModal && selectedVideo && (
                <ConfirmDeleteModal
                    onClose={() => setShowVideoDeleteModal(false)}
                    videoTitle={selectedVideo.title}
                    onDeleteConfirm={handleVideoDeleteConfirm} // 임시 핸들러
                    addToast={addToast}
                />
            )}
        </main>
    );
}

export default MyPage;
import React, { useState, useEffect, useMemo } from 'react'; // 🚨 useMemo 추가
import { useParams, useNavigate } from 'react-router-dom';
// Modals.js에서 컴포넌트 import
import { 
    ConfirmDeleteModal, 
    EditVideoModal, 
    EditCommentModal 
} from './components/Modals'; 


// --- 가짜(Mock) 데이터 정의 (🚨 영상 ID별로 댓글을 다르게 설정) ---
const mockCommentsData = {
  '1': [ // 데드리프트 100kg (ID: 1)
    { id: 101, user: 'trainer_kim', text: '허리가 살짝 말리는 경향이 있습니다. 복압을 더 단단히 잡고 엉덩이를 조금 더 낮춰보세요.', time: '1시간 전' },
    { id: 102, user: 'deadlift_pro', text: '와우, 힘 정말 좋네요! 멋집니다!', time: '30분 전' },
  ],
  '2': [ // 스쿼트 초보 (ID: 2)
    { id: 201, user: 'squat_master', text: '무릎 통증은 대부분 발목 유연성이나 고관절 문제입니다. 폼롤러 스트레칭을 먼저 해주세요.', time: '2시간 전' },
    { id: 202, user: 'beginner_helper', text: '혹시 신발 밑창이 너무 푹신한가요? 단단한 신발로 바꿔보시는 걸 추천합니다.', time: '1시간 전' },
    { id: 203, user: 'user1', text: '응원합니다!', time: '방금 전' },
  ],
  '3': [ // 벤치프레스 60kg (ID: 3)
    { id: 301, user: 'bench_expert', text: '팔꿈치를 몸통에 조금 더 붙이고, 가슴을 활짝 열어 견갑골을 고정해보세요. 자극이 달라질 겁니다.', time: '5시간 전' },
    { id: 302, user: 'muscle_lover', text: '속도가 너무 빠릅니다. 내릴 때(이완 시) 3초 정도 천천히 내려보세요.', time: '1일 전' },
  ],
  // 나머지 영상 및 기본값
  default: [
    { id: 901, user: '피드백_봇', text: '영상을 분석 중입니다. 곧 전문가 피드백이 달릴 예정입니다.', time: '10분 전' },
  ],
};

function getMockComments(videoId) {
    // ID가 존재하면 해당 ID의 댓글 목록을 반환, 없으면 기본 목록 반환
    return mockCommentsData[videoId] || mockCommentsData.default;
}


// --- 상세 페이지 컴포넌트 (수정됨) ---
function VideoDetailPage({ isLoggedIn, user, addToast, onVideoUpdated, onVideoDeleted, videos }) { 
    const { videoId } = useParams(); 
    const navigate = useNavigate(); 

    // 🚨 초기 댓글 상태를 videoId에 따라 동적으로 설정
    const initialComments = useMemo(() => getMockComments(videoId), [videoId]);

    // 비디오 및 댓글 관련 상태
    const [video, setVideo] = useState(null); 
    const [comments, setComments] = useState(initialComments); // 🚨 초기 상태로 설정
    const [newComment, setNewComment] = useState('');
    
    // 모달 관련 상태
    const [showVideoEditModal, setShowVideoEditModal] = useState(false);
    const [showVideoDeleteModal, setShowVideoDeleteModal] = useState(false);
    const [showCommentEditModal, setShowCommentEditModal] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);

    const currentUserName = user?.nickname;

    // 🚀 useEffect: videos prop이 변경될 때마다 해당 영상을 찾고 로컬 video 상태를 갱신합니다.
    useEffect(() => {
        const foundVideo = videos.find(v => v.id === videoId);
        
        if (foundVideo) {
            setVideo({ 
                ...foundVideo,
                description: foundVideo.title + '에 대한 자세한 피드백 요청입니다.', 
            });
        } else {
            setVideo(null); 
        }
        
    }, [videoId, videos, addToast]); 

    const isVideoOwner = isLoggedIn && currentUserName === video?.user;

    // --- 댓글 핸들러 ---
    const handleCommentSubmit = (e) => { 
        e.preventDefault();
        if (!isLoggedIn || !newComment.trim()) {
            addToast('로그인하고 댓글을 입력해주세요.');
            return;
        }
        
        const newCommentObj = {
            id: Date.now(),
            user: currentUserName,
            text: newComment,
            time: '방금 전',
        };
        
        // 🚨 새 댓글은 기존 댓글 목록에 추가
        setComments(prev => [newCommentObj, ...prev]); 
        setNewComment('');
        addToast('댓글이 등록되었습니다.');
    };
    
    const handleEditCommentStart = (comment) => { 
        setSelectedComment(comment);
        setShowCommentEditModal(true);
    };
    
    const handleCommentSave = (commentId, newText) => { 
        setComments(prev => 
            prev.map(c => c.id === commentId ? { ...c, text: newText } : c)
        );
        setShowCommentEditModal(false); 
    };
    
    const handleDeleteComment = (commentId) => { 
        // 🚨 window.confirm 대신 Custom Modal을 사용하는 것이 좋지만, 기존 로직 유지
        if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            setComments(prev => prev.filter(c => c.id !== commentId));
            addToast('댓글이 삭제되었습니다.');
        }
    };
    
    // --- 영상 수정/삭제 핸들러 (생략) ---
    const handleVideoSave = (newVideoId, newTitle, newFile) => {
        onVideoUpdated(newVideoId, newTitle); 
        
        setVideo(prev => ({ 
            ...prev, 
            title: newTitle,
            videoUrl: newFile ? `/mock_updated_${newVideoId}_${Date.now()}.mp4` : prev.videoUrl
        })); 
        
        setShowVideoEditModal(false);
        addToast('영상이 성공적으로 수정되었습니다!'); 
    };

    const handleVideoDelete = () => {
        onVideoDeleted(video.id); 
        setShowVideoDeleteModal(false);
        addToast('영상이 삭제되었습니다.');
        navigate('/community'); 
    };


    if (!video) {
        return <div className="community-page-container container" style={{padding: '2rem 0', textAlign: 'center'}}>영상을 로딩 중이거나 요청하신 영상 (ID: {videoId})를 찾을 수 없습니다.</div>;
    }

    return (
        <main className="community-page-container container">
            <button 
                onClick={() => navigate('/community')} 
                style={{
                    padding: '0.5rem 1rem', 
                    fontSize: '1rem', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc', 
                    backgroundColor: 'white', 
                    cursor: 'pointer',
                    marginBottom: '1rem'
                }}
            >
                &larr; 커뮤니티 목록으로 돌아가기
            </button>

            {/* 영상 플레이어 영역 */}
            <div className="video-player-area" style={{ 
                backgroundColor: '#333', 
                height: '400px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                borderRadius: '8px',
                marginBottom: '1rem',
                overflow: 'hidden'
            }}>
                {video.videoUrl ? (
                    <video 
                        width="100%" 
                        height="100%" 
                        controls 
                        poster="/video_poster.jpg"
                        style={{ objectFit: 'contain', backgroundColor: 'black' }} 
                        key={video.id}
                    >
                        <source src={video.videoUrl} type="video/mp4" />
                        죄송합니다. 비디오를 지원하지 않는 브라우저입니다.
                    </video>
                ) : (
                    <span style={{ color: 'white', fontSize: '1.5rem' }}>[영상 URL을 찾을 수 없습니다.]</span>
                )}
            </div>

            {/* 영상 정보 영역 */}
            <div className="video-details" style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#333' }}>{video.title}</h2>
                    
                    {/* 수정/삭제 버튼 (소유자에게만 노출) */}
                    {isVideoOwner && (
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                            <button 
                                onClick={() => setShowVideoEditModal(true)} 
                                className="btn-secondary" 
                                style={{padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: '#3b82f6', color: 'white'}}
                            >
                                수정
                            </button>
                            <button 
                                onClick={() => setShowVideoDeleteModal(true)} 
                                className="btn-secondary" 
                                style={{padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: '#fecaca', color: '#dc2626', border: 'none'}}
                            >
                                삭제
                            </button>
                        </div>
                    )}
                </div>
                
                <p style={{ color: '#777', margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
                    업로더: <strong style={{color: '#2563eb'}}>{video.user}</strong> | 운동: {video.type} | 조회수: {video.views}회 | 등록일: {video.createdAt}
                </p>
                <p style={{ marginTop: '1rem', fontSize: '1.1rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                    {video.description}
                </p>
            </div>
            
            {/* 댓글/피드백 영역 */}
            <div className="feedback-section">
                <h3 style={{borderBottom: '2px solid #333', paddingBottom: '0.5rem'}}>피드백 ({comments.length}개)</h3>
                
                {/* 댓글 폼 */}
                <form onSubmit={handleCommentSubmit} style={{marginBottom: '2rem'}}>
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={isLoggedIn ? "피드백을 남겨주세요." : "로그인 후 댓글을 남길 수 있습니다."}
                        rows="3"
                        style={{width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical'}}
                        disabled={!isLoggedIn}
                    />
                    <button 
                        type="submit" 
                        className="submit-button" 
                        style={{width: 'auto', padding: '0.5rem 1rem'}}
                        disabled={!isLoggedIn || newComment.trim() === ''}
                    >
                        댓글 등록
                    </button>
                </form>

                {/* 댓글 목록 */}
                <div className="comments-list">
                    {comments.map(comment => (
                        <div key={comment.id} style={{borderBottom: '1px dashed #eee', padding: '0.75rem 0'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                {/* 닉네임과 시간 */}
                                <p style={{margin: '0', fontWeight: 'bold'}}>{comment.user} <span style={{fontSize: '0.8rem', color: '#999', fontWeight: 'normal'}}>{comment.time}</span></p>
                                
                                {/* 댓글 수정/삭제 버튼 */}
                                {isLoggedIn && comment.user === currentUserName && (
                                    <div style={{display: 'flex', gap: '0.5rem'}}>
                                        <button 
                                            onClick={() => handleEditCommentStart(comment)}
                                            style={{background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem', padding: 0}}
                                        >
                                            수정
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteComment(comment.id)}
                                            style={{background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', padding: 0}}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p style={{margin: '0.5rem 0 0 0'}}>{comment.text}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* 모달 렌더링 */}
            {showVideoEditModal && <EditVideoModal 
                onClose={() => setShowVideoEditModal(false)} 
                video={video}
                onSave={handleVideoSave}
                addToast={addToast}
            />}
            {showVideoDeleteModal && <ConfirmDeleteModal 
                onClose={() => setShowVideoDeleteModal(false)} 
                videoTitle={video.title}
                onDeleteConfirm={handleVideoDelete}
                addToast={addToast}
            />}

            {showCommentEditModal && selectedComment && <EditCommentModal 
                onClose={() => setShowCommentEditModal(false)} 
                comment={selectedComment}
                onSave={handleCommentSave}
                addToast={addToast}
            />}
        </main>
    );
}

export default VideoDetailPage;
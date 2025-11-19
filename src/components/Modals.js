import React, { useState } from 'react';

// --- A. 영상 수정 모달 (EditVideoModal) ---
export function EditVideoModal({ onClose, video, onSave, addToast }) {
    const [title, setTitle] = useState(video.title);
    const [newFile, setNewFile] = useState(null); 
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setNewFile(e.target.files[0]);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            addToast('제목을 입력해주세요.');
            return;
        }
        
        setUploading(true);
        setTimeout(() => {
            setUploading(false);
            onSave(video.id, title, newFile);
            onClose(); 
        }, 1500);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>영상 수정</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label htmlFor="edit-title">영상 제목</label>
                        <input
                            type="text"
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="새 제목을 입력하세요."
                            disabled={uploading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-file">영상 파일 교체 (선택 사항)</label>
                        <input
                            type="file"
                            id="edit-file"
                            accept="video/mp4,video/quicktime"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        {newFile && <p style={{fontSize: '0.85rem', color: '#3b82f6', marginTop: '0.25rem'}}>선택된 파일: {newFile.name}</p>}
                    </div>

                    <button type="submit" className="submit-button" disabled={uploading}>
                        {uploading ? '수정 및 업로드 중...' : '수정 완료'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- B. 영상 삭제 확인 모달 (ConfirmDeleteModal) ---
export function ConfirmDeleteModal({ onClose, videoTitle, onDeleteConfirm, addToast }) {
    const onDelete = () => {
        onDeleteConfirm();
        addToast(`"${videoTitle}" 영상이 삭제되었습니다.`);
        onClose(); // 🚨 모달 닫기 로직 추가
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px'}}>
                <div className="modal-header">
                    <h2>영상 삭제 확인</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <p style={{marginBottom: '1.5rem'}}>
                    정말로 영상 **"{videoTitle}"**을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
                <button 
                    onClick={onDelete} 
                    className="submit-button" 
                    style={{backgroundColor: '#dc2626'}}
                >
                    영구 삭제하기
                </button>
            </div>
        </div>
    );
}

// --- C. 댓글 수정 모달 (EditCommentModal) ---
export function EditCommentModal({ onClose, comment, onSave, addToast }) {
    const [editText, setEditText] = useState(comment.text);

    const handleSave = (e) => {
        e.preventDefault();
        if (!editText.trim()) {
            addToast('댓글 내용을 입력해주세요.');
            return;
        }
        onSave(comment.id, editText);
        addToast('댓글이 수정되었습니다.');
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '450px'}}>
                <div className="modal-header">
                    <h2>댓글 수정</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label htmlFor="edit-comment-text">내용</label>
                        <textarea
                            id="edit-comment-text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows="4"
                            style={{width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical'}}
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        수정 완료
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- D. 계정 삭제 확인 모달 (DeleteAccountModal) ---
export function DeleteAccountModal({ onClose, user, onAccountDelete, addToast }) {
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleDelete = () => {
        if (confirmPassword !== '1234') { 
            addToast('비밀번호가 일치하지 않습니다. (데모)');
            return;
        }
        onAccountDelete();
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '450px'}}>
                <div className="modal-header">
                    <h2>⚠️ 계정 영구 삭제</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <p style={{marginBottom: '1rem', color: '#dc2626'}}>
                    **경고:** 회원님의 영상 및 피드백 기록이 모두 영구 삭제되며 복구할 수 없습니다.
                </p>
                <div className="form-group">
                    <label>삭제를 확인하려면 비밀번호를 입력하세요.</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="비밀번호" 
                    />
                </div>
                <button 
                    onClick={handleDelete} 
                    className="submit-button" 
                    style={{backgroundColor: '#dc2626', marginTop: '1rem'}}
                    disabled={!confirmPassword}
                >
                    {user.nickname} 계정 영구 삭제
                </button>
            </div>
        </div>
    );
}
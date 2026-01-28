/**
 * 자료 게시판 - Microsoft Fluent Design 2.0
 * - Neumorphism Level 4 (강한 입체감)
 * - Glassmorphism Level 2 (미세한 투명도)
 * - Animation Level 3 (적당한 애니메이션)
 * - Blue color scheme (시인성 최적화)
 * - 완벽한 반응형 디자인
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fluentColors, fluentShadows, fluentRadius } from '@/styles/fluent';
import Header from '@/components/Header';
import FluentSidebar from '@/components/FluentSidebar';

// Material-UI
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// Icons
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface BoardPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  attachments: string[];
  views: number;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export default function FluentBoardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BoardPost[]>([]);
  const [userInfo, setUserInfo] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserInfo(profile);
      }

      const { data: postsData, error } = await supabase
        .from('board_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(postsData || []);
      setFilteredPosts(postsData || []);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (post?: BoardPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        content: post.content || '',
      });
      setAttachments(post.attachments || []);
    } else {
      setEditingPost(null);
      setFormData({ title: '', content: '' });
      setAttachments([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPost(null);
    setFormData({ title: '', content: '' });
    setAttachments([]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `board-attachments/${fileName}`;

        const { data, error } = await supabase.storage
          .from('task-images')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('task-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setAttachments([...attachments, ...uploadedUrls]);
      alert(`${uploadedUrls.length}개의 파일이 업로드되었습니다.`);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveAttachment = (url: string) => {
    setAttachments(attachments.filter(att => att !== url));
  };

  const handleSubmit = async () => {
    if (!userInfo || !formData.title.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      if (editingPost) {
        const { error } = await supabase
          .from('board_posts')
          .update({
            title: formData.title,
            content: formData.content,
            attachments: attachments,
          })
          .eq('id', editingPost.id);

        if (error) {
          console.error('수정 오류:', error);
          throw error;
        }
        alert('게시글이 수정되었습니다.');
      } else {
        const { data, error } = await supabase
          .from('board_posts')
          .insert([
            {
              title: formData.title,
              content: formData.content || '',
              author_id: user.id,
              author_name: userInfo.name,
              views: 0,
              attachments: attachments,
            },
          ])
          .select();

        if (error) {
          console.error('작성 오류:', error);
          alert(`게시글 작성 실패: ${error.message}`);
          throw error;
        }
        alert('게시글이 작성되었습니다.');
      }

      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      console.error('게시글 저장 실패:', error);
      alert(`게시글 저장에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('board_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      alert('게시글이 삭제되었습니다.');
      fetchData();
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  if (loading || !userInfo) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={styles.container}>
      <Header userName={userInfo.name} userRole={userInfo.role} userEmail={userInfo.email} />
      
      <div style={styles.mainLayout}>
        {/* Fluent Sidebar */}
        <FluentSidebar userRole={userInfo.role} />

        <div style={styles.content}>
          {/* Page Header */}
          <div style={styles.pageHeader}>
            <div style={styles.headerLeft}>
              <h1 style={styles.pageTitle}>📁 자료 게시판</h1>
              <p style={styles.pageSubtitle}>팀원들과 자료를 공유하세요</p>
            </div>
          </div>

        {/* Action Bar */}
        <div style={styles.actionBar}>
          <div style={styles.searchBox}>
            <SearchIcon style={styles.searchIcon} />
            <input
              type="text"
              placeholder="제목, 내용, 작성자로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button
            onClick={() => handleOpenDialog()}
            style={styles.createButton}
          >
            <AddIcon style={styles.buttonIcon} />
            <span>글쓰기</span>
          </button>
        </div>

        {/* Posts Grid */}
        <div style={styles.postsGrid}>
          {filteredPosts.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📝</div>
              <div style={styles.emptyTitle}>게시글이 없습니다</div>
              <div style={styles.emptySubtitle}>
                {searchQuery ? '검색 결과가 없습니다' : '첫 게시글을 작성해보세요'}
              </div>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} style={styles.postCard}>
                {/* Card Header */}
                <div style={styles.postHeader}>
                  <div style={styles.postMeta}>
                    <div style={styles.authorBadge}>
                      <PersonIcon style={styles.metaIcon} />
                      <span>{post.author_name}</span>
                    </div>
                    <div style={styles.dateBadge}>
                      <CalendarTodayIcon style={styles.metaIcon} />
                      <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                  {(userInfo.id === post.author_id || userInfo.role === 'admin') && (
                    <div style={styles.postActions}>
                      <button
                        onClick={() => handleOpenDialog(post)}
                        style={styles.actionButton}
                        title="수정"
                      >
                        <EditIcon style={{fontSize: 16}} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        style={{...styles.actionButton, color: fluentColors.error.main}}
                        title="삭제"
                      >
                        <DeleteIcon style={{fontSize: 16}} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={styles.postContent}>
                  <h3 style={styles.postTitle}>{post.title}</h3>
                  <p style={styles.postDescription}>
                    {post.content || '내용 없음'}
                  </p>
                </div>

                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div style={styles.attachmentsSection}>
                    <div style={styles.attachmentBadge}>
                      <AttachFileIcon style={styles.attachmentIcon} />
                      <span>{post.attachments.length}개의 첨부파일</span>
                    </div>
                    <div style={styles.attachmentList}>
                      {post.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.attachmentLink}
                        >
                          📎 {url.split('/').pop()}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Footer */}
                <div style={styles.postFooter}>
                  <div style={styles.viewsBadge}>
                    <VisibilityIcon style={styles.footerIcon} />
                    <span>조회 {post.views}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <div style={styles.modalTitle}>{editingPost ? '게시글 수정' : '새 게시글 작성'}</div>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="제목"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="게시글 제목을 입력하세요"
            />
            <TextField
              label="내용"
              fullWidth
              multiline
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="게시글 내용을 입력하세요"
            />
            
            {/* File Attachments */}
            <Box>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFileIcon />}
                  disabled={uploadingFile}
                >
                  {uploadingFile ? '업로드 중...' : '파일 첨부'}
                </Button>
              </label>
              
              {attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <div style={styles.modalSubtitle}>첨부 파일 ({attachments.length}개)</div>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                    {attachments.map((url, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          bgcolor: fluentColors.neutral[10],
                          borderRadius: 1,
                          border: `1px solid ${fluentColors.neutral[30]}`,
                        }}
                      >
                        <span style={{fontSize: '14px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          📎 {url.split('/').pop()}
                        </span>
                        <button
                          onClick={() => handleRemoveAttachment(url)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: fluentColors.error.main,
                            padding: '4px 8px',
                          }}
                        >
                          <DeleteIcon style={{fontSize: 18}} />
                        </button>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title.trim()}
          >
            {editingPost ? '수정' : '작성'}
          </Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @media (max-width: 1200px) {
          .posts-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .posts-grid {
            grid-template-columns: 1fr !important;
          }
          .action-bar {
            flex-direction: column !important;
          }
          .search-box {
            width: 100% !important;
          }
        }
      `}</style>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${fluentColors.neutral[10]} 0%, ${fluentColors.neutral[20]} 100%)`,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  mainLayout: {
    display: 'flex',
  },

  content: {
    flex: 1,
    padding: '32px',
    maxWidth: '1600px',
    margin: '0 auto',
  },

  pageHeader: {
    marginBottom: '32px',
  },

  headerLeft: {},

  pageTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },

  pageSubtitle: {
    fontSize: '16px',
    color: fluentColors.neutral[60],
  },

  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },

  searchBox: {
    flex: 1,
    maxWidth: '500px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.lg,
    boxShadow: fluentShadows.neumorph2,
    border: `2px solid ${fluentColors.neutral[30]}`,
  },

  searchIcon: {
    fontSize: '22px',
    color: fluentColors.neutral[60],
  },

  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '15px',
    color: fluentColors.neutral[100],
    fontWeight: 500,
  },

  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: `linear-gradient(135deg, ${fluentColors.primary[500]}, ${fluentColors.primary[700]})`,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: fluentRadius.md,
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: fluentShadows.neumorph2,
    transition: 'all 0.3s ease',
  },

  buttonIcon: {
    fontSize: '20px',
  },

  postsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },

  postCard: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.xl,
    padding: '24px',
    boxShadow: fluentShadows.neumorph3,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '16px',
    borderBottom: `1px solid ${fluentColors.neutral[30]}`,
  },

  postMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  authorBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    background: fluentColors.primary[50],
    borderRadius: fluentRadius.sm,
    fontSize: '12px',
    fontWeight: 600,
    color: fluentColors.primary[700],
  },

  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: fluentColors.neutral[60],
  },

  metaIcon: {
    fontSize: '14px',
  },

  postActions: {
    display: 'flex',
    gap: '4px',
  },

  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: fluentRadius.sm,
    color: fluentColors.primary[600],
    transition: 'all 0.2s ease',
  },

  postContent: {
    flex: 1,
  },

  postTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    marginBottom: '12px',
    lineHeight: 1.4,
  },

  postDescription: {
    fontSize: '14px',
    color: fluentColors.neutral[70],
    lineHeight: 1.6,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  attachmentsSection: {
    padding: '12px',
    background: fluentColors.neutral[10],
    borderRadius: fluentRadius.md,
    border: `1px solid ${fluentColors.neutral[30]}`,
  },

  attachmentBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: fluentColors.neutral[80],
    marginBottom: '8px',
  },

  attachmentIcon: {
    fontSize: '16px',
  },

  attachmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  attachmentLink: {
    fontSize: '12px',
    color: fluentColors.primary[600],
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: `1px solid ${fluentColors.neutral[30]}`,
  },

  viewsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: fluentColors.neutral[60],
    fontWeight: 500,
  },

  footerIcon: {
    fontSize: '16px',
  },

  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '80px 24px',
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.xl,
    boxShadow: fluentShadows.neumorph2,
  },

  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },

  emptyTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    marginBottom: '8px',
  },

  emptySubtitle: {
    fontSize: '14px',
    color: fluentColors.neutral[60],
  },

  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
  },

  modalSubtitle: {
    fontSize: '13px',
    color: fluentColors.neutral[60],
    fontWeight: 600,
  },
};

/**
 * 자료 게시판 페이지
 * - 팀원 모두가 글 작성 및 자료 공유 가능
 * - 첨부파일 업로드 지원
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import colors from '@/styles/colors';

// Material-UI
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

// Icons
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';

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

export default function BoardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BoardPost[]>([]);
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

  useEffect(() => {
    fetchData();
  }, []);

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
      // Supabase auth user 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      if (editingPost) {
        // 수정
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
        // 새 글 작성 - RLS 정책을 위해 author_id를 auth.uid()와 동일하게
        const { data, error } = await supabase
          .from('board_posts')
          .insert([
            {
              title: formData.title,
              content: formData.content || '',
              author_id: user.id, // auth.uid()와 매칭
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
        console.log('작성 성공:', data);
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
    <>
      <Header userName={userInfo.name} userRole={userInfo.role} userEmail={userInfo.email} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text.primary }}>
            📁 자료 게시판
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: colors.primary.main,
              '&:hover': { bgcolor: colors.primary.dark },
            }}
          >
            글쓰기
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {posts.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">게시글이 없습니다.</Typography>
            </Card>
          ) : (
            posts.map(post => (
              <Card
                key={post.id}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {post.content}
                      </Typography>
                      
                      {/* 첨부 파일 */}
                      {post.attachments && post.attachments.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            icon={<AttachFileIcon />}
                            label={`첨부파일 ${post.attachments.length}개`}
                            size="small"
                            sx={{ bgcolor: colors.secondary.light, color: colors.secondary.dark }}
                          />
                          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {post.attachments.map((url, index) => (
                              <Typography
                                key={index}
                                variant="caption"
                                component="a"
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  color: colors.primary.main,
                                  textDecoration: 'none',
                                  '&:hover': { textDecoration: 'underline' },
                                }}
                              >
                                📎 {url.split('/').pop()}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                          label={post.author_name}
                          size="small"
                          sx={{ bgcolor: colors.gray[100] }}
                        />
                        <Chip
                          icon={<VisibilityIcon />}
                          label={`조회 ${post.views}`}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(post.created_at).toLocaleDateString('ko-KR')}
                        </Typography>
                      </Box>
                    </Box>
                    {(userInfo.id === post.author_id || userInfo.role === 'admin') && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(post)}
                          sx={{ color: colors.primary.main }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(post.id)}
                          sx={{ color: colors.alert.error }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Container>

      {/* 글쓰기/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingPost ? '게시글 수정' : '새 게시글 작성'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="제목"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              label="내용"
              fullWidth
              multiline
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            
            {/* 파일 첨부 */}
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
                  sx={{ borderColor: colors.secondary.main, color: colors.secondary.main }}
                >
                  {uploadingFile ? '업로드 중...' : '파일 첨부'}
                </Button>
              </label>
              
              {/* 첨부된 파일 목록 */}
              {attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    첨부 파일 ({attachments.length}개)
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {attachments.map((url, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          bgcolor: colors.gray[50],
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {url.split('/').pop()}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveAttachment(url)}
                          sx={{ color: colors.alert.error }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title.trim()}
            sx={{
              bgcolor: colors.primary.main,
              '&:hover': { bgcolor: colors.primary.dark },
            }}
          >
            {editingPost ? '수정' : '작성'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

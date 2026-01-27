# 🔧 Supabase 자료 게시판 RLS 정책 수정

자료 게시판에서 글 작성이 안 되는 이유는 RLS (Row Level Security) 정책 때문입니다.

## 해결 방법

Supabase SQL Editor에서 아래 SQL을 실행하세요:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can create posts" ON board_posts;

-- 새로운 정책: 인증된 사용자는 자유롭게 작성 가능
CREATE POLICY "Authenticated users can create posts"
  ON board_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

이렇게 하면 author_id 검증 없이 글 작성이 가능합니다.

## 또는 더 간단한 방법

```sql
-- RLS 비활성화 (개발/테스트 환경)
ALTER TABLE board_posts DISABLE ROW LEVEL SECURITY;
```

⚠️ **주의**: RLS를 비활성화하면 보안이 약해지므로, 프로덕션 환경에서는 권장하지 않습니다.

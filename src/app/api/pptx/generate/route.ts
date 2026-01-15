/**
 * PPT 생성 API
 * GET /api/pptx/generate - 주간 완료 업무 기반 PPT 생성
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateWeeklyPPT, getWeeklyDateRange } from '@/lib/pptx-generator';

export async function GET(request: Request) {
  try {
    // 주간 날짜 범위 계산
    const { start, end } = getWeeklyDateRange();

    // 완료된 업무 조회
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('status', 'Done')
      .gte('completed_at', start.toISOString())
      .lte('completed_at', end.toISOString())
      .order('completed_at', { ascending: true });

    if (error) {
      throw new Error(`업무 조회 실패: ${error.message}`);
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '완료된 업무가 없습니다.',
          dateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // PPT 생성
    const pptx = await generateWeeklyPPT(tasks);

    // PPT를 Base64로 변환
    const pptxBlob = await pptx.write('base64');

    // 파일명 생성
    const fileName = `주간보고서_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.pptx`;

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        content: pptxBlob,
        taskCount: tasks.length,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    });
  } catch (error: any) {
    console.error('PPT 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'PPT 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

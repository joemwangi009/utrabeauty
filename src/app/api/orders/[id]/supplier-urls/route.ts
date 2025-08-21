import { NextRequest, NextResponse } from 'next/server';
import { getOrderSupplierUrls } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const supplierUrls = await getOrderSupplierUrls(orderId);
    
    return NextResponse.json({
      success: true,
      data: {
        orderId,
        supplierUrls,
        count: supplierUrls.length
      }
    });
  } catch (error) {
    console.error('Error fetching supplier URLs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supplier URLs' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, createOrder, getOrdersWithSupplierInfo } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeSupplierInfo = searchParams.get('includeSupplierInfo') === 'true';

    let orders;
    if (includeSupplierInfo) {
      orders = await getOrdersWithSupplierInfo(limit, offset);
    } else {
      orders = await getAllOrders(limit, offset);
    }

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        limit,
        offset,
        total: orders.length
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['orderNumber', 'customerId', 'customerName', 'customerEmail', 'totalPrice'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const order = await createOrder(body);

    return NextResponse.json({
      success: true,
      data: order
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 
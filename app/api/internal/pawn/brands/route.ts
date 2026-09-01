import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { itemFields } from '@/lib/internal/pawn'
import { createBrand, listBrands } from '@/lib/pawn-catalog-store'
export const runtime='nodejs'
export async function GET(request:NextRequest){if(!await getCurrentAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});const q=String(new URL(request.url).searchParams.get('q')||'').trim().toLowerCase();const rows=listBrands().filter(row=>!q||[row.name,row.slug].join(' ').toLowerCase().includes(q)).map(row=>({id:row.id,category_id:row.category_id,name:row.name,slug:row.slug,logo_url:row.logo_url,sort_order:row.sort_order,status:row.status}));return NextResponse.json({data:rows})}
export async function POST(request:NextRequest){const admin=await getCurrentAdmin();if(!admin)return NextResponse.json({error:'Unauthorized'},{status:401});const body=await request.json().catch(()=>({}));const v=itemFields(body,'brand');if(!v.name||!v.slug)return NextResponse.json({error:'Nama brand wajib diisi.'},{status:400});const created=createBrand({name:v.name,slug:v.slug,logoUrl:v.image||undefined,sortOrder:v.sortOrder,status:v.status,categoryId:body.categoryId});if(!created)return NextResponse.json({error:'Kategori brand tidak valid.'},{status:400});return NextResponse.json({ok:true,id:created.id},{status:201})}

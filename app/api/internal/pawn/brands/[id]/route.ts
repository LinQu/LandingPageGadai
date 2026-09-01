import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { itemFields } from '@/lib/internal/pawn'
import { updateBrand } from '@/lib/pawn-catalog-store'
export const runtime='nodejs'
export async function PATCH(request:NextRequest,context:{params:Promise<{id:string}>}){const admin=await getCurrentAdmin();if(!admin)return NextResponse.json({error:'Unauthorized'},{status:401});const {id}=await context.params;if(!/^\d+$/.test(id))return NextResponse.json({error:'ID tidak valid.'},{status:400});const body=await request.json().catch(()=>({}));const v=itemFields(body,'brand');if(!v.name||!v.slug)return NextResponse.json({error:'Nama brand wajib diisi.'},{status:400});const updated=updateBrand(Number(id),{name:v.name,slug:v.slug,logoUrl:v.image||undefined,sortOrder:v.sortOrder,status:v.status,categoryId:body.categoryId});if(!updated)return NextResponse.json({error:'Brand atau kategori tidak ditemukan.'},{status:404});return NextResponse.json({ok:true})}

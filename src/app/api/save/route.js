import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MongoClient } from 'mongodb'

// ✅ Ensure all env vars are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const mongoUri = process.env.MONGODB_URI

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Supabase URL or Key is missing in environment variables.')
}

if (!mongoUri) {
  throw new Error('❌ MongoDB URI is missing in environment variables.')
}

// 🔗 Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req) {
  try {
    const body = await req.json()
    const { url, summary, urduSummary, fullText } = body

    // 🧾 Save summary to Supabase
    const { error: supabaseError } = await supabase
      .from('summaries')
      .insert({ url, summary, urdu_summary: urduSummary })

    if (supabaseError) {
      console.error('❌ Supabase error:', supabaseError)
      return NextResponse.json({ error: 'Failed to save to Supabase' }, { status: 500 })
    }

    // 🧾 Save full text to MongoDB
    const client = new MongoClient(mongoUri)
    await client.connect()

    const db = client.db('blog_data')
    const collection = db.collection('full_texts')

    await collection.insertOne({
      url,
      fullText,
      createdAt: new Date(),
    })

    await client.close()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Save API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account.provider === 'google') {
        try {
          // Get auth.users ID (Supabase Auth creates this automatically)
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id)
          const userId = authUser?.user?.id || user.id

          // Insert/update user in custom users table
          const { error } = await supabaseAdmin
            .from('users')
            .upsert({
              id: userId,
              email: user.email,
              full_name: user.name,
              avatar_url: user.image,
            }, {
              onConflict: 'id'
            })

          if (error) {
            console.error('Error syncing user to users table:', error)
            // Don't fail login, just log the error
          } else {
            console.log('✅ User synced to users table:', userId)
          }
          
          return true
        } catch (error) {
          console.error('Sign in error:', error)
          return true // Allow sign in even if sync fails
        }
      }
      return true
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

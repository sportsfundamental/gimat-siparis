import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { Role } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              dealerProfile: true,
              customerProfile: {
                include: {
                  dealer: true,
                },
              },
            },
          })

          if (!user) return null

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) return null

          let dealerId = user.dealerId

          if (user.role === Role.DEALER && user.dealerProfile) {
            dealerId = user.dealerProfile.id
          } else if (user.role === Role.CUSTOMER && user.customerProfile) {
            dealerId = user.customerProfile.dealerId
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            dealerId: dealerId ?? undefined,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { id: string; role: Role; dealerId?: string }).role
        token.dealerId = (user as { id: string; role: Role; dealerId?: string }).dealerId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.dealerId = token.dealerId as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/giris',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

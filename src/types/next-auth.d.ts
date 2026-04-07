import { Role } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: Role
    dealerId?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      dealerId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    dealerId?: string
  }
}

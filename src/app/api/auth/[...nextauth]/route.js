import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// 🚀 REGLA DE RESTAURACIÓN: CONFIGURACIÓN OFICIAL DE INICIO DE SESIÓN CON GOOGLE
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/', // Redirige de vuelta a tu raíz en caso de cualquier error
  },
};

const handler = NextAuth(authOptions);

// Next.js App Router exige explícitamente exportar el manejador como GET y POST
export { handler as GET, handler as POST };

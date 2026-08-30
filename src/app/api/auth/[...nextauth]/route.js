import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // Esta clave secreta la jala automáticamente desde tu archivo .env.local
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/', // Redirige a tu página de inicio si hay algún detalle
  }
};

const handler = NextAuth(authOptions);

// Exportamos los métodos GET y POST requeridos por Next.js para procesar la sesión
export { handler as GET, handler as POST };

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();

        try {
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          };
        } catch (error) {
          console.log("Error: ", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };

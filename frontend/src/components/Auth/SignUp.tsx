// import React, { useState } from 'react';
// import supabase from '../../lib/supabaseClient';

// const SignUp: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(false);
//     const { error } = await supabase.auth.signUp({ email, password });
//     setLoading(false);
//     if (error) {
//       setError(error.message);
//     } else {
//       setSuccess(true);
//     }
//   };

//   return (
//     <div className="signup-container">
//       <form className="signup-form" onSubmit={handleSubmit}>
//         <h2>Sign Up</h2>
//         <label htmlFor="email">Email</label>
//         <input
//           id="email"
//           type="email"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           required
//           autoComplete="email"
//           className="signup-input"
//         />
//         <label htmlFor="password">Password</label>
//         <input
//           id="password"
//           type="password"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           required
//           autoComplete="new-password"
//           className="signup-input"
//         />
//         <button type="submit" className="signup-button" disabled={loading}>
//           {loading ? 'Signing up...' : 'Sign Up'}
//         </button>
//         {error && <div className="signup-error">{error}</div>}
//         {success && <div className="signup-success">Check your email to confirm your account!</div>}
//       </form>
//     </div>
//   );
// };

// export default SignUp;

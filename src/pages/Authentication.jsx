export default function Authentication() {

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    // handle sign-in logic here
    await fetch(`https://0s6pd20t-4000.use.devtunnels.ms/api/user/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',   
      },
    }).then((response) => response.json()).then((data) => {
      console.log(data.password, password);
     if (data.password === password) {
        alert('Sign-in successful!');
        window.location.href = '/goals';
     }
      else {
        alert('Invalid credentials. Please try again.');
      } 
    });

  }
  return (
    <div className="authentication">
      <h2>Sign In</h2>
      {/* add sign-in form here */}

      <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: "0 auto" }}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          style={{
            display: "block",
            marginBottom: 12,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            width: "100%",
            maxWidth: 300,
          }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          style={{
            display: "block",
            marginBottom: 12,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            width: "100%",
            maxWidth: 300,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            background: "#1E90FF",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  )
}

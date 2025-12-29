export async function getAccessToken(app: FastifyTypeBox, user: { email: string; password: string }) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/signin',
    payload: {
      email: user.email,
      password: user.password
    }
  });
  const responseBody = response.json();

  return responseBody.data.access_token;
}

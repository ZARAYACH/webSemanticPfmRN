import {
  AuthenticationApi,
  BASE_PATH,
  BookControllerApi,
  BorrowingControllerApi,
  Configuration,
  ExceptionDto,
  SignupApi,
  TokensApi,
  UsersApi
} from "@/app/openapi";

const tokensApi = new TokensApi();

const conf = new Configuration({
  credentials: 'include',
  middleware: [{
    post: async context => {
      console.log(context.response?.status)
      if (context.response.status === 400 || context.response.status === 404 || context.response.status === 500) {
        const response: ExceptionDto = await context.response.json();
      }
      if (context.response.status === 500) {
        const response: ExceptionDto = await context.response.json();
      }
      if (context.response?.status === 401) {
        console.log("fff")
        await tokensApi.refreshToken();
        console.log("token refreshed")
        return context.init && await fetch(context.url, context.init);
      }
    }
  }],
});

const authApi = new AuthenticationApi(conf);
const bookApi = new BookControllerApi(conf);
const borrowingApi = new BorrowingControllerApi(conf);
const signupApi = new SignupApi(conf);
const usersApi = new UsersApi(conf);


export {
  authApi,
  bookApi,
  borrowingApi,
  signupApi,
  usersApi
}
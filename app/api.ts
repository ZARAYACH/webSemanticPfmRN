import {
  AuthenticationApi,
  BookControllerApi,
  BorrowingControllerApi,
  Configuration,
  ExceptionDto,
  SignupApi,
  TokensApi,
  UsersApi
} from "@/app/openapi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const tokensApi = new TokensApi();

const conf = new Configuration({
  credentials: 'include',
  middleware: [{
    post: async context => {
      if (context.response.status === 400 || context.response.status === 404 || context.response.status === 500) {
        const response: ExceptionDto = await context.response.json();
        console.log(response)
      }
      if (context.response?.status === 401 &&
        !context.url.includes("/login")) {
        const resp = await tokensApi.refreshToken().catch(reason => console.error(reason));
        if (resp && resp?.["access_token"]) {
          await AsyncStorage.setItem('token', resp.access_token)
        }
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
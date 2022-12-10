import {AxiosResponse} from "axios";
import {authAPI, ResponseType} from "../api/todolists-api";
import {call, put, takeEvery} from "redux-saga/effects";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {setIsInitializedAC} from "./app-reducer";

export function* initializeAppWorkerSaga() {
    const res: AxiosResponse<ResponseType> = yield call(authAPI.me)
    if (res.data.resultCode === 0) {
        yield put(setIsLoggedInAC(true))
    } else {

    }
    yield put(setIsInitializedAC(true))
}

export const initializeApp = () => ({type: "APP/INITIALIZE-APP"})

export function* appWatcherSaga() {
    yield takeEvery('APP/INITIALIZE-APP', initializeAppWorkerSaga)

}
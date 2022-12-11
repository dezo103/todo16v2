import {initializeAppWorkerSaga} from "./app-sagas";
import {call} from "redux-saga/effects";
import {authAPI} from "../api/todolists-api";


test('initializeAppWorkerSaga', () => {
    const gen = initializeAppWorkerSaga()
    const result = gen.next()
    expect(result.value).toEqual(call(authAPI.me))
})
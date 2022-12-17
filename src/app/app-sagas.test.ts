import {initializeAppWorkerSaga} from "./app-sagas";
import {call, put} from "redux-saga/effects";
import {authAPI, ResponseType} from "../api/todolists-api";
import {AxiosResponse} from "axios";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {setIsInitializedAC} from "./app-reducer";


let meResponse: AxiosResponse<ResponseType>

beforeEach(() => {
    meResponse = {
        data: {
            resultCode: 0,
            messages: [],
            fieldsErrors: [],
            data: {}
        },
        status: 200, statusText: '', headers: {}, config: {}
    }
})

test('initializeAppWorkerSaga login success', () => {
    const gen = initializeAppWorkerSaga()
    let result = gen.next()
    expect(result.value).toEqual(call(authAPI.me))

    result = gen.next(meResponse)
    expect(result.value).toEqual(put(setIsLoggedInAC(true)))

    result = gen.next()
    expect(result.value).toEqual(put(setIsInitializedAC(true)))
})


test('initializeAppWorkerSaga login unsuccess', () => {
    const gen = initializeAppWorkerSaga()
    let result = gen.next()
    expect(result.value).toEqual(call(authAPI.me))

    meResponse.data.resultCode = 1

    result = gen.next(meResponse)
    expect(result.value).toEqual(put(setIsInitializedAC(true)))
})


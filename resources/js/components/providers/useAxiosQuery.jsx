import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";

import { apiUrl, token } from "./appConfig";

export function POST(
    url,
    key_name,
    isLoading = true,
    onSuccessFunction,
    onProgress
) {
    const queryClient = useQueryClient();
    return useMutation(
        async (data) => {
            if (isLoading) {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading) {
                    globalLoading.classList.remove("globalLoading");
                }
            }
            return await axios
                .post(apiUrl(url), data, {
                    headers: {
                        Authorization: token(),
                    },
                    onUploadProgress: (progressEvent) => {
                        let percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        if (onProgress) onProgress(percentCompleted);
                    },
                })
                .then((res) => res.data);
        },
        {
            onSuccess: () => {
                if (onSuccessFunction) onSuccessFunction();
                if (key_name) {
                    if (typeof key_name === "string") {
                        queryClient.refetchQueries(key_name);
                    } else {
                        key_name.forEach((name) => {
                            queryClient.refetchQueries(name);
                        });
                    }
                }

                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading && !globalLoading.matches(".hidden")) {
                    globalLoading.classList.add("hidden!");
                }
            },
            onError: () => {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading && !globalLoading.matches(".hidden")) {
                    globalLoading.classList.add("hidden!");
                }
            },
        }
    );
}

export function UPDATE(
    url,
    key_name,
    isLoading = true,
    onSuccessFunction,
    onProgress
) {
    const queryClient = useQueryClient();

    return useMutation(
        async (data) => {
            if (isLoading) {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading) {
                    globalLoading.classList.remove("hidden!");
                }
            }
            return await axios
                .put(apiUrl(`${url}/${data.id}`), data, {
                    headers: {
                        Authorization: token(),
                    },
                    onUploadProgress: (progressEvent) => {
                        let percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        if (onProgress) onProgress(percentCompleted);
                    },
                })
                .then((res) => res.data);
        },
        {
            onSuccess: () => {
                if (onSuccessFunction) onSuccessFunction();
                // console.log(key_name);
                if (key_name) {
                    if (typeof key_name === "string") {
                        queryClient.refetchQueries(key_name);
                    } else {
                        key_name.forEach((name) => {
                            queryClient.refetchQueries(name);
                        });
                    }
                }

                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading && !globalLoading.matches(".hidden")) {
                    document
                        .querySelector(".globalLoading")
                        .classList.add("hidden!");
                }
            },
            onError: () => {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading && !globalLoading.matches(".hidden")) {
                    document
                        .querySelector(".globalLoading")
                        .classList.add("hidden!");
                }
            },
        }
    );
}

export function DELETE(
    url,
    key_name,
    isLoading = true,
    onSuccessFunction,
    onProgress
) {
    const queryClient = useQueryClient();

    return useMutation(
        async (data) => {
            if (isLoading) {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading) {
                    globalLoading.classList.remove("hide");
                }
            }
            return await axios
                .delete(apiUrl(`${url}/${data.id}`), {
                    headers: {
                        Authorization: token(),
                    },
                    onUploadProgress: (progressEvent) => {
                        let percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        if (onProgress) onProgress(percentCompleted);
                    },
                })
                .then((res) => res.data);
        },
        {
            onSuccess: () => {
                if (onSuccessFunction) onSuccessFunction();
                if (key_name) {
                    if (typeof key_name === "string") {
                        queryClient.refetchQueries(key_name);
                    } else {
                        key_name.forEach((name) => {
                            queryClient.refetchQueries(name);
                        });
                    }
                }

                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading && !globalLoading.matches(".hidden")) {
                    document
                        .querySelector(".globalLoading")
                        .classList.add("hidden!");
                }
            },
            onError: () => {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading && !globalLoading.matches(".hidden")) {
                    document
                        .querySelector(".globalLoading")
                        .classList.add("hidden!");
                }
            },
        }
    );
}

export function GET(url, key_name, onSuccessFunction, isLoading = true) {
    return useQuery(
        key_name,
        async () => {
            if (isLoading) {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading) {
                    globalLoading.classList.remove("hidden!");
                }
            }
            return await axios
                .get(apiUrl(url), {
                    headers: {
                        Authorization: token(),
                    },
                })
                .then((res) => res.data);
        },
        {
            retry: 1,
            retryDelay: 500,
            fetchOnWindowFocus: false,
            refetchOnWindowFocus: false,
            onSuccess: (res) => {
                if (onSuccessFunction) onSuccessFunction(res);

                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading && !globalLoading.matches(".hidden")) {
                    document
                        .querySelector(".globalLoading")
                        .classList.add("hidden!");
                }
            },
            onError: () => {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading && !globalLoading.matches(".hidden")) {
                    document
                        .querySelector(".globalLoading")
                        .classList.add("hidden!");
                }
            },
        }
    );
}

export function GETMANUAL(url, key_name, onSuccessFunction, isLoading = true) {
    return useQuery(
        key_name,
        () => {
            if (isLoading) {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading) {
                    globalLoading.classList.remove("hidden!");
                }
            }
            return axios
                .get(apiUrl(url), {
                    headers: {
                        Authorization: token(),
                    },
                })
                .then((res) => res.data);
        },
        {
            enabled: false,
            retry: 1,
            retryDelay: 500,
            fetchOnWindowFocus: false,
            refetchOnWindowFocus: false,
            onSuccess: (res) => {
                if (onSuccessFunction) onSuccessFunction(res);

                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading && !globalLoading.matches(".hidden")) {
                    document
                        .querySelector(".globalLoading")
                        .classList.add("hidden!");
                }
            },
            onError: () => {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading && !globalLoading.matches(".hidden")) {
                    document
                        .querySelector(".globalLoading")
                        .classList.add("hidden!");
                }
            },
        }
    );
}

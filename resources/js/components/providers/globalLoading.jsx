export default function globalLoading(loading = true) {
    let globalLoading = document.querySelector(".globalLoading");
    if (globalLoading) {
        if (loading) {
            globalLoading.classList.remove("hide");
        } else {
            globalLoading.classList.add("hide");
        }
    }
}

export function hasToken() {
    let token = localStorage.getItem("token")
    return token !==null
}
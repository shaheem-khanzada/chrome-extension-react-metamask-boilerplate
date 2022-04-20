export const getNormalizeAddress = (accounts) => {
    return accounts[0] ? accounts[0].toLowerCase() : null
}
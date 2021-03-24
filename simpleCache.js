const maxCacheNum = 10;
const cachedResult = []


function getCachedResult(key) {
	const result = cachedResult.find(e => e.key === key)
	if (result) {
		return result.content
	}
	return null
}

function storeCache(key, content) {
	cachedResult.push({
		key: key,
		value: content
	})
	if (cachedResult.length > maxCacheNum) {
		cachedResult.shift()
	}
	return content
}

exports.getCachedResult = getCachedResult
exports.storeCache = storeCache
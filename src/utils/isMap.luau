--!strict
--!native
--!optimize 2

local function isMap(value: unknown): boolean
	if type(value) ~= "table" then
		return false
	end

	return true
end

return isMap

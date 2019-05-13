function success(data) {
    return {
        resMessage: "成功",
        resCode: "000",
        data: data
    };
}

function fail(message) {
    return {
        resMessage: message,
        resCode: "001",
        data: ""
    };
}

exports.success = success
exports.fail = fail

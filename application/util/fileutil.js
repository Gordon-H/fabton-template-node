const crypto = require('crypto');
const request = require('request-promise');

async function calFileHash(url) {
    const hash = crypto.createHash('sha256');
    // console.log(dd)
    let res = ''
    try {
        res = await request(url)
        hash.update(res)
        res = hash.digest('hex')
        console.log(res)
    } catch (e) {
        console.log('========== calculate file hash failed ===========')
        console.log('url = ' + url)
    }
    return res
    // request(url, function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         hash.update(body)
    //         res = hash.digest('hex')
    //         process(res)
    //     }else{
    //         process('')
    //     }
    // })
    // hash.setEncoding("hex")

    // await request(url).pipe(hash).pipe(process.stdout)
    // 上传到oss服务器
    // .pipe(request.put('http://veb.com/upload'))
    // hash.update('some data to hash');
    // console.log(hash.digest('hex'));
    // return hash.digest('hex')

    // return {
    //     resMessage: "成功",
    //     resCode: "000",
    //     data: data
    // };
}

exports.calFileHash = calFileHash

async function cal() {
    res = await calFileHash('http://gss0.bdstatic.com/7LsWdDW5_xN3otebn9fN2DJv/doc/pic/item/96dda144ad345982f674f11805f431adcaef84b9.jpg', (h) => {
        console.log('res = ' + h)
    })
    console.log('contines= ' + res)
}

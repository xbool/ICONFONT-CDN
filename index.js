/*
 * 2017.09.08
 * zhan :)
 * Mac Automator 服务，用于上传阿里妈妈平台上下载的 iconfont 代码文件夹中字体文件到 CDN，并且替换 css 代码文件中的字体路径，最后复制到粘贴板
 * **接口信息已隐去，该代码不能直接运行**
*/
function run(input, parameters) {
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
    var hash = app.doShellScript('md5 -qs $RANDOM');
    var config = {
        // fontName: 'iconfont',
        group: 'hfe',
        repoName: 'xxx',
    }
    config.assetsUrl = `//**上传后的 CDN 地址已隐去**/${config.group}/${config.repoName}`;
    config.fontName = 'iconfont-' + hash;

    var strPath = input.toString();
    if (!strPath) {
        strPath = app.chooseFolder().toString();
    }
    var appSys = Application('System Events');
    var fileNames = appSys.folders.byName(strPath).diskItems.name();
    var curls = [];

    ObjC.import('Foundation')

    const readFile = function(path, encoding) {
        !encoding && (encoding = $.NSUTF8StringEncoding)

        const fm = $.NSFileManager.defaultManager
        const data = fm.contentsAtPath(path)
        const str = $.NSString.alloc.initWithDataEncoding(data, encoding)
        return ObjC.unwrap(str)
    }

    var content = readFile(`${strPath}/iconfont.css`);

    var getCurls = function(name) {
        var hashName = getHashName(name);
        return `curl -F "file=@${strPath}/${name}" -F "publishType=assets:publish" -F "group=${config.group}" -F "clearCache=true" -F "repoName=${config.repoName}" -F "filePath=${hashName}"  **上传接口地址已隐去**`;
    }

    var getHashName = function(name) {
        let tmp = name.split('.');
        tmp.splice(-1, 0, hash);
        return tmp.join('.');
    }

    fileNames.forEach(name => {
        if (name.match(/\.eot|\.svg|\.woff|\.ttf/)) {
            curls.push(getCurls(name));
            var hashName = getHashName(name);
            content = content.replace(new RegExp(name, 'gi'), `${config.assetsUrl}/${hashName}`);
            content = content.replace(new RegExp('"iconfont"', 'gi'), `"${config.fontName}"`);
        }
    });
    // var str = $.NSString.alloc.initWithUTF8String(content);
    // str.writeToFileAtomically('/tmp/iconfont', true);
    app.displayNotification('', {
        withTitle: '字体文件上传中...',
    });
    curls.forEach(v => {
        app.doShellScript(v);
    });
    app.setTheClipboardTo(content);
    app.displayNotification('成功上传到 CDN ~', {
        withTitle: 'CSS 代码已成功复制到剪切板！',
        subtitle: ''
    });
    // debugger;
    return content;
}
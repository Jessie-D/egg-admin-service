'use strict';

module.exports = (action = '1') => {
    return async function (ctx, next) {
        await next();

        if (!ctx.session.userInfo) {
            if (ctx.acceptJSON) {
                ctx.body = {
                    code: ctx.helper.errorCode.NOTLOGIN,
                    msg: '账号未登录',
                    result: {
                        userId: ctx.session.userInfo,
                        uri: action,
                    },
                };
                ctx.status = 200;
            } else {
                ctx.redirect('/login?redirect=' + encodeURIComponent(ctx.originalUrl));
            }

            return false;
        }

        const result = await (ctx.app.mysql.get('back').query('select distinct bm.* from back_role_module rm left join back_module bm on rm.module_id=bm.id left join back_user_role ur on rm.role_id=ur.role_id WHERE ur.user_id=? AND bm.module_uri=?', [ctx.session.userInfo.id, action]));

        ctx.logger.info('permission:', {
            userId: ctx.session.userInfo.id,
            action,
        }, '=> ' + !!result.length);

        return !!result.length;
    };
}
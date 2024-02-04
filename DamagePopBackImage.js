/*=============================================================================
 DamagePopBackImage.js
----------------------------------------------------------------------------
 (C)2024 Triacontane
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.0.0 2024/02/04 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc ダメージポップ背景画像プラグイン
 * @target MZ
 * @url https://github.com/triacontane/RPGMakerMV/tree/mz_master/DamagePopBackImage.js
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @author トリアコンタン
 *
 * @param damageImage
 * @text ダメージ背景
 * @desc HP,MPダメージを受けたときの背景画像
 * @default
 * @type file
 * @dir img/pictures
 *
 * @param recoveryImage
 * @text 回復背景
 * @desc HP,MP回復を受けたときの背景画像
 * @default
 * @type file
 * @dir img/pictures
 *
 * @param offsetX
 * @text X座標調整値
 * @desc ダメージポップのX座標の調整値です。
 * @default 0
 * @type number
 * @min -2000
 * @max 2000
 *
 * @param offsetY
 * @text Y座標調整値
 * @desc ダメージポップのY座標の調整値です。
 * @default 0
 * @type number
 * @min -2000
 * @max 2000
 *
 * @param opacity
 * @text 背景画像の不透明度
 * @desc 背景画像の不透明度です。
 * @default 255
 * @type number
 * @min 0
 * @max 255
 *
 * @help DamagePopBackImage.js
 *　
 * このプラグインの利用にはベースプラグイン『PluginCommonBase.js』が必要です。
 * 『PluginCommonBase.js』は、RPGツクールMZのインストールフォルダ配下の
 * 以下のフォルダに格納されています。
 * dlc/BasicResources/plugins/official
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(() => {
    'use strict';
    const script = document.currentScript;
    const param = PluginManagerEx.createParameter(script);

    const _Sprite_Damage_createMiss = Sprite_Damage.prototype.createMiss;
    Sprite_Damage.prototype.createMiss = function() {
        this.createBackImageSprite();
        _Sprite_Damage_createMiss.apply(this, arguments);
    };

    const _Sprite_Damage_createDigits = Sprite_Damage.prototype.createDigits;
    Sprite_Damage.prototype.createDigits = function(baseRow, value) {
        this.createBackImageSprite();
        _Sprite_Damage_createDigits.apply(this, arguments);
        if (this._digit) {
            this._backSprite.digit = (this._digit - 1) / 2;
        }
    };

    Sprite_Damage.prototype.createBackImageSprite = function() {
        const name = this._colorType % 2 === 0 ? param.damageImage : param.recoveryImage;
        const sprite = this.createChildSprite(200, 200);
        sprite.bitmap = ImageManager.loadPicture(name);
        sprite.anchor.y = 0.5;
        sprite.x = param.offsetX || 0;
        sprite.dy = 0;
        sprite.opacity = param.opacity || 255;
        if (this._digit) {
            this._digit = 0;
        }
        this._backSprite = sprite;
        return sprite;
    };

    const _Sprite_Damage_updateChild = Sprite_Damage.prototype.updateChild;
    Sprite_Damage.prototype.updateChild = function(sprite) {
        _Sprite_Damage_updateChild.apply(this, arguments);
        if (sprite === this._backSprite) {
            sprite.y += (-this.fontSize() / 2) + param.offsetY || 0;
        }
    }

    const _Sprite_Damage_destroy = Sprite_Damage.prototype.destroy;
    Sprite_Damage.prototype.destroy = function(options) {
        if (this._backSprite) {
            this.removeChild(this._backSprite);
            this._backSprite = null;
        }
        _Sprite_Damage_destroy.apply(this, arguments);
    }
})();

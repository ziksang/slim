import {createStore} from 'slim-store'

export default {
    createStore: createStore,
    install: function (Vue) {
        const version = Number(Vue.version.split('.')[0])

        if (version >= 2) {
            Vue.mixin({
                created: slimInit,
                data() {
                    return {
                        store: null
                    }
                }
            })
        } else {
            // override init and inject vslim init procedure
            // for 1.x backwards compatibility.
            const _init = Vue.prototype._init
            Vue.prototype._init = function (options = {}) {
                options.init = options.init
                    ? [slimInit].concat(options.init)
                    : slimInit
                _init.call(this, options)
            }
        }

        function slimInit() {
            const options = this.$options
            // store injection
            if (options.store) {
                this.store = typeof options.store === 'function'
                    ? {
                        ...options.store(),
                        state: options.store.getState()
                    }
                    : {
                        ...options.store,
                        state: options.store.getState()
                    }

                this.store.applyPlugin({
                    after: (state) => {
                        this.$set(this.store, 'state', state)
                    }
                })
            } else if (options.parent && options.parent.store) {
                this.store = options.parent.store
            }
        }
    }
}

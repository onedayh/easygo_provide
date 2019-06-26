<template>
    <div>
        <eg-header :menu="headMenu"/>
        <div class="wrap">
            <eg-sidebar :menu="barMenu"/>
            <div class="container">
                <eg-title/>
                <router-view :style="{'min-height': viewHeight + 'px'}"/>
            </div>
        </div>
        <eg-footer/>
    </div>
</template>

<script>
    import headers from '@/components/headers';
    import sidebars from '@/components/sidebars';
    import footers from '@/components/footers';
    import titles from '@/components/titles';
    import util from '@/util/util';

    export default {
        name: "shipping",
        components: {
            'eg-header': headers,
            'eg-sidebar': sidebars,
            'eg-footer': footers,
            'eg-title': titles
        },
        data(){
            return{
                headMenu: '出货',
                barMenu: [],
                viewHeight: 0
            }
        },

        created(){
            let that = this;
            that.barMenu = util.getSideData(that.headMenu);
            that.viewHeight = util.getViewHeight();
        }
    }
</script>
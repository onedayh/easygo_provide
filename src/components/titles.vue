<template>
    <div id="titles">{{titles}}</div>
</template>

<script>
    import {mapState} from 'vuex';

    export default {
        name: "titles",

        computed: {
            ...mapState(['titles'])
        }
    }
</script>

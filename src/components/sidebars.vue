<template>
    <div id="sidebars">
        <dl v-for="(item, index) in menu" :key="index">
            <dt>{{item.name}}</dt>
            <router-link
                tag="dd"
                :to="it.path"
                v-for="(it, idx) in item.children"
                :key="idx"
            >
                {{it.name}}
            </router-link>
        </dl>
    </div>

</template>

<script>
    export default {
        name: "sidebars",
        props: {
            menu: {
                type: Array,
                default: () => {
                    return []
                }
            }
        }
    }
</script>
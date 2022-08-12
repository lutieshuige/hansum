<script>
export default {
    props: ['msg'],
    data() {
        return {
            name: 'hansum',
        }
    },
    beforeCreate() {
        console.log(this.name);
    },
    created() {
        console.log(this.name);
    },
    beforeMount() {
        console.log(document.getElementById('hello')?.innerHTML, this.$el);
    },
    mounted() {
        console.log(document.getElementById('hello')?.innerHTML, this.$el);

    },

}
</script>
<template>
    <div id="hello">
        <h2>{{ name }}</h2> {{ msg }}
    </div>
</template>
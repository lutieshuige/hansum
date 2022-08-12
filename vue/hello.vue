<template>
    <div class="title">
        {{ message }}
    </div>
</template>

<script>
export default {
    name: 'app',
    data() {
        return {
            message: 'hello vue!'
        }
    }
}
</script>

<style lang="style">
.title {
    color: red;
}
</style>
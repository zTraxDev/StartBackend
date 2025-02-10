import mongoose from 'mongoose';
const exampleSchema = new mongoose.Schema({
    name: String,
    age: Number,
});
export const Example = mongoose.model('Example', exampleSchema);
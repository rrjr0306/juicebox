const { 
    client,
    getAllUsers,
    getAllPosts,
    getPostsByUser,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getUserById,
    createTags,
    createPostTag,
    addTagsToPost,
    getPostById
} = require('./index');

const tagTestList = ['#happy', '#youcandoanything', '#test']


async function createInitialUsers() {
    try {
        console.log("Starting to create users...");

        await createUser({username: 'albert', password: 'bertie99', name: 'al', location: 'daytona' });
        await createUser({username: 'sandra', password: '2sandy4me', name: 'sandy', location: 'jax'});
        await createUser({username: 'glamgal', password: 'soglam', name: 'gal', location: 'staug'})



        console.log("Finished creating users!");
    } catch(error) {
        console.error("Error creating users!");
        throw error;
    }
}

async function createInitialPosts() {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();

        console.log('starting to create posts...');
        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post, Blah Blah Blah"
        });

        await createPost({
            authorId: sandra.id,
            title: "what am i doing here",
            content: "what the ..."
        });

        await createPost({
            authorId: glamgal.id,
            title: "my username",
            content: "what kind of username did i give myself!?"
        });
        
        console.log('finished creating posts!')
    } catch (error) {
        console.log('Error creating posts!');
        throw error
    }
}

async function dropTables() {
    try {
        console.log("Starting to drop tables...");

        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);
        
        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error; 
    }
}

async function createTables() {
    try {
        console.log("Starting to build tables...")

        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                name varchar(255) NOT NULL,
                location varchar(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id),
                title varchar(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
              );
            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name varchar(255) UNIQUE NOT NULL 
            );            
            CREATE TABLE post_tags 
            (
                "postId" INTEGER REFERENCES posts(id), 
                "tagId" INTEGER REFERENCES tags(id), 
                UNIQUE ("postId", "tagId")
                )       
        `);

        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!");
        throw error; // we pass the error up to the function that calls createTables
    } 
}

async function createInitialTags() {
    try {
        console.log("Starting to create tags...");
    
        const [happy, sad, inspo, catman] = await createTags([
          '#happy', 
          '#worst-day-ever', 
          '#youcandoanything',
          '#catmandoeverything'
        ]);
    
        const [postOne, postTwo, postThree] = await getAllPosts();
    
        await addTagsToPost(postOne.id, [happy, inspo]);
        await addTagsToPost(postTwo.id, [sad, inspo]);
        await addTagsToPost(postThree.id, [happy, catman, inspo]);
    
        console.log("Finished creating tags!");
      } catch (error) {
        console.log("Error creating tags!");
        throw error;
      }
}



async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
        await createInitialTags();
    } catch (error) {
        throw error;
    } 
}

async function testDB() {
    try {
        console.log("Starting to test database...");

        // console.log("creating initial posts");
        // const initialPosts = await createInitialPosts();
        // console.log('Result:', initialPosts);

        // console.log('creating posts table');
        // const postsTable = await createPostsTable();
        // console.log('Result', postsTable);

        console.log("Calling getAllUsers");
        const users = await getAllUsers();
        console.log("Result:", users);

        console.log("calling updateUser on users[0]")
        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
        });
        console.log("Result:", updateUserResult);

        console.log("Calling getAllPosts");
        const posts = await getAllPosts();
        console.log("Result:", posts);
    
        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
          title: "New Title",
          content: "Updated Content"
        });
        console.log("Result:", updatePostResult);
    
        console.log("Calling getUserById with 1");
        const albert = await getUserById(1);
        console.log("Result:", albert);

        

        // console.log("creating tags...")
        // const createdTags = await createTags();
        // console.log("Result:", createdTags)


        console.log("Finished database tests!");
    } catch (error) {
        console.error("Error testing database!");
        throw error;
    }
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());
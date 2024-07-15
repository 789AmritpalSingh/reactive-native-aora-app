import { Client, Account, ID, Avatars, Databases, Query, Storage } from "react-native-appwrite";

// we just need to create Databases and Storage part on appwrite
// export const config = {
//   endpoint: "https://cloud.appwrite.io/v1",
//   platform: "com.amrit.aora",
//   projectId: "666df0510020d5c7afe1",
//   databaseId: "666df85200140d2f4392",
//   userCollectionId: "666df88e00009715068b",
//   videoCollectionId: "666df8bb000edb78e7d3",
//   storageId: "666dfa38000ba5763db9",
// };

// new config
export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.amrit.aora",
  projectId: "668607ef000bd06f45d8",
  databaseId: "668608fc000947ba2513",
  userCollectionId: "66860912001c4af679c3",
  videoCollectionId: "668609290035c1f1c187",
  storageId: "66860a4c00112ab68435",
};

const { // destructuring
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId
} = config;

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projectId) // Your project ID
  .setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error('Failed to create account');

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    // Below code is for deleting the active current session, so that error - Creation of session is prohibited when a session is active does not comes
    // Attempt to list existing sessions
    // try {
    //   const sessions = await account.listSessions();
    //   console.log('Sessions', sessions);
    //   if (sessions.total > 0) {
    //     for (const session of sessions.sessions) {
    //       await account.deleteSession(session.$id);
    //     }
    //   }
    // } catch (error) {
    //   // Handle the case where there are no existing sessions
    //   if (error.code !== 404) {
    //     console.log('Error listing sessions:', error);
    //     throw new Error(error);
    //   }
    //   // If error code is 404, it means there are no sessions, continue to create a new one
    //   console.log('No existing sessions, proceeding to create a new session.');
    // }

    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    console.log('Sign In Error:', error);
    throw new Error(error);
  }
}

export const getCurrentUser = async () => {
  // Below functionality is for if the user has logged in before it will give access to the current user.
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error('No current account');

    // if we do have a current account
    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if (!currentUser) throw Error('User not found');

    return currentUser.documents[0]; // we only need one user.

  } catch (error) {
    console.log('Get Current User Error:', error);
  }
}

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.orderDesc("$createdAt")])

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.orderDesc("$createdAt"), Query.limit(7)])

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.search('title', query)])

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.equal('creator', userId), Query.orderDesc("$createdAt")])

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const signOut = async() => {
  try {
    const session = await account.deleteSession('current');
    return session;
  } catch (error) {
    throw new Error(error);
  }
}

export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if(type === 'video'){
      fileUrl = storage.getFileView(storageId, fileId)
    }

    else if(type === 'image'){
      fileUrl  =storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100)
    }else{
      throw new Error('Invalid file type')
    }

    if(!fileUrl) throw Error;

    // if everything succeeds
    return fileUrl;

  } catch (error) {
    throw new Error(error)
  }
}

export const uploadFile = async (file, type) => {
  if(!file) return;  // if file does not exist
  // const {mimeType, ...rest} = file;
  // const asset = {type: mimeType, ...rest};
  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri
  }

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type)
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

export const createVideo = async(form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'), 
      uploadFile(form.video, 'video'),
    ])

    const newPost = await databases.createDocument(databaseId, videoCollectionId, ID.unique(), {
      title: form.title,

      thumbnail: thumbnailUrl,
      video: videoUrl,
      prompt: form.prompt,
      creator: form.userId
    })

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
}
/** @format */

const User = require("./model");

const { encrpyt_one_way, pairing_one_way } = require("../../lib/crypt");

const {
  create_access_token,
  create_refresh_token,
  verify_refresh_token,
} = require("../../lib/jwt");

const { GENESIS_PASSWORD } = require("../../config/var");
const { ROLE, RefreshToken } = require("../../config/enum");

const genesis = async (req, res) => {
  try {
    //check duplicated username
    const user = await User.find();

    if (user.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Genesis already created",
      });
    } else {
      const encrypted_password = await encrpyt_one_way(GENESIS_PASSWORD);

      // create user
      User.create({
        username: "SUPER",
        display_name: "SUPER",
        role: ROLE.SUPERADMIN,
        password: encrypted_password,
      })
        .then((user) => {
          //generate access token and refresh token
          const access_token = create_access_token(user._id, ROLE.SUPERADMIN);
          const refresh_token = create_refresh_token(user._id, ROLE.SUPERADMIN);

          //send cookie with contain refresh token
          res.cookie(RefreshToken, refresh_token, {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24), //one day
            httpOnly: true,
            secure: true,
            sameSite: "none",
          });

          res.status(201).json({
            status: 201,
            message: "success",
            id: user._id,
            username: user.username,
            display_name: user.display_name,
            role: ROLE.SUPERADMIN,
            access_token,
          });
        })
        .catch((error) => {
          console.log(error);
          return res.status(400).json({
            status: 400,
            message: "failed to create an genesis account",
          });
        });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const me = async (req, res) => {
  try {
    const token = req.token;

    if (!token) {
      return res.status(400).json({
        status: 400,
        message: "forbidden",
      });
    } else {
      User.findOne({ _id: token.id })
        .then((user) => {
          res.status(200).json({
            status: 200,
            message: "success",
            id: user._id,
            username: user.username,
            display_name: user.display_name,
            role: user.role,
            access_token: token.token,
          });
        })
        .catch((error) => {
          console.log(error);
          return res.status(400).json({
            status: 400,
            message: "User not found",
          });
        });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    //check username is exist
    User.findOne({ username })
      .then(async (user) => {
        //compare the password
        const hashPassword = await pairing_one_way(
          password.toString(),
          user.password
        );

        if (hashPassword) {
          //generate access token and refresh token
          const access_token = create_access_token(user._id, user.role);
          // const refresh_token = create_refresh_token(user._id, user.role);

          //send cookie with contain refresh token
          // res.cookie(RefreshToken, refresh_token, {
          //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // one day
          //   httpOnly: true,
          //   secure: true,
          //   sameSite: "none",
          // });

          res.status(200).json({
            status: 200,
            message: "success",
            id: user._id,
            username: user.username,
            display_name: user.display_name,
            role: user.role,
            access_token,
          });
        } else {
          return res.status(400).json({
            status: 400,
            message: "password doesn't match, please insert a correct password",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message:
            "username not exist, make sure to register your username first",
        });
      });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const refresh = async (req, res) => {
  try {
    const { RefreshToken } = req.cookies;
    //when user not sent cookie refresh token
    if (!RefreshToken) {
      return res.status(400).json({
        status: 400,
        message: "forbidden",
      });
    } else {
      verify_refresh_token(RefreshToken, (error, decoded) => {
        if (error) {
          console.log(error);
          return res.status(401).json({
            status: 401,
            message: "forbidden",
          });
        } else {
          // generate token
          const access_token = create_access_token(decoded.id, decoded.role);
          const refresh_token = create_refresh_token(decoded.id, decoded.role);

          //send cookie with contain refresh token
          res.cookie(RefreshToken, refresh_token, {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24), //one day
            httpOnly: true,
            secure: true,
            sameSite: "none",
          });

          res.status(200).json({
            status: 200,
            message: "success",
            role: decoded.role,
            access_token,
          });
        }
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const user_list = async (req, res) => {
  try {
    User.find(
      {},
      { _id: 1, username: 1, display_name: 1, role: 1, created_at: 1 }
    )
      .then((users) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: users,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: [],
          message: "No User Found",
        });
      });
  } catch (error) {
    console.log(error.message);
    res.status(404).json({
      status: 404,
      message: "server error",
    });
  }
};

const register = async (req, res) => {
  const { password, display_name, username } = req.body;
  const role = ROLE.DEFAULT;

  try {
    //check duplicated username
    User.findOne({ username })
      .then(async (user) => {
        if (user) {
          return res.status(400).json({
            status: 400,
            message: "username was used, try use another username",
          });
        } else {
          const encrypted_password = await encrpyt_one_way(password);

          // create user
          User.create({
            username,
            display_name,
            role,
            password: encrypted_password,
          })
            .then((new_user) => {
              //generate access token and refresh token
              const access_token = create_access_token(new_user._id, role);
              const refresh_token = create_refresh_token(new_user._id, role);

              //send cookie with contain refresh token
              res.cookie(RefreshToken, refresh_token, {
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24), //one day
                httpOnly: true,
                secure: true,
                sameSite: "none",
              });

              res.status(201).json({
                status: 201,
                message: "success",
                data: {
                  id: new_user._id,
                  username: new_user.username,
                  display_name: new_user.display_name,
                  role,
                  access_token,
                },
              });
            })
            .catch((error) => {
              console.log(error);
              return res.status(400).json({
                status: 400,
                message: "failed to create an account",
              });
            });
        }
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "failed to create an account",
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const adjust = async (req, res) => {
  const { id } = req.params;
  const { username = null, display_name = null, password = null } = req.body;

  try {
    let new_password = "";
    if (password) {
      new_password = await encrpyt_one_way(password);
    }

    User.updateOne(
      { _id: id },
      { username, display_name, password: new_password }
    )
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update user ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "user not found",
        });
      });
  } catch (err) {
    return res.status(404).json({
      status: 404,
      message: "failed to update user",
    });
  }
};

const takedown = async (req, res) => {
  const { id } = req.params;
  try {
    User.deleteOne({ _id: id })
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully takedown user ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "user not found",
        });
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

module.exports = {
  genesis,
  me,
  login,
  refresh,
  user_list,
  register,
  adjust,
  takedown,
};

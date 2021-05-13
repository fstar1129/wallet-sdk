// General React Libraries
import React, { Component } from 'react';

// Function libraries
import { magic } from '../../constants/constants';
import './login.scss';

// React components
import Blockies from 'react-blockies';

interface topProps {
    changeStatus: (bool) => void;
    oAuth: boolean;
}

interface topState {
    open: boolean
    userAddress: string
    username: string
    addressPart: string
    addEnd: string
    icon: any,
    loginMethod: string,
}

export class Top extends Component<topProps, topState> {
    state = {
        open: false,
        userAddress: "",
        username: "",
        addressPart: "",
        addEnd: "",
        icon: "",
        loginMethod: "",
    };

    async componentDidMount() {
        const { oAuth } = this.props;
        let user_in = (await magic.user.getMetadata()).email;
        let address_in = (await magic.user.getMetadata()).publicAddress;

        if (!oAuth) {
            this.setState({
                loginMethod: "email",
            })
        } else {
            this.setState({
                loginMethod: "OAuth",
            })
        }

        var userAdd = "";
        var addressEnd = ""
        this.setState({ userAddress: user_in });
        this.setState({ username: address_in });
        for (let i = 0; i < 15; ++i) {
            userAdd += address_in[i];
        }
        userAdd += '...';
        for (let i = address_in.length - 5; i < address_in.length; ++i) {
            userAdd += address_in[i];
        }
        userAdd += ' ';
        this.setState({ addressPart: userAdd });
        this.setState({ addEnd: addressEnd });

        this.setState({
            icon: <Blockies
                seed={address_in}
                size={6}
                scale={6}
            >
            </Blockies>
        });

        document.addEventListener('mousedown', this.handleClick, false);
    }

    render() {
        return (
            <div className="Top">
                <header className="Top-header">
                    <h1 id="main"> <div className="logo_box">WALLETTE</div></h1>
                    <div id="profile">
                        {this.handleState()}
                    </div>
                </header>
                <p ref={this.container}></p>
            </div>
        );
    }

    container: any = React.createRef();
    node: any;

    handleState = () => {
        if (this.state.open) {
            return this.openProfile();
        } else {
            return this.closeProfile();
        }
    }

    switchState = () => {
        if (this.state.open)
            this.setState({ open: false });
        else
            this.setState({ open: true });
    }

    handleClick = (e) => {
        if (!this.node.contains(e.target) && !this.container.current.contains(e.target) && this.state.open) {
            this.setState({ open: false });
        }
    }

    logout = async () => {
        document.removeEventListener('mousedown', this.handleClick, false);

        await magic.user.logout();

        this.props.changeStatus(await magic.user.isLoggedIn());
    }

    openProfile = () => {
        console.log("address:", this.state.username);
        console.log("email:", this.state.userAddress);
        return (
            <div >
                <a href="!#" onClick={this.switchState} ref={node => this.node = node}>
                    {this.state.icon}
                </a>
                <div className="profile-Box" ref={this.container}>
                    <p className="icon-display">{this.state.icon} {this.state.userAddress}</p>

                    <div>
                        <p id="user-Address">Logged in with {this.state.loginMethod}</p> 
                        <a href="!#" id="user-Address">{this.state.addressPart}
                            <span className="copy-hov">{this.state.username}</span>
                        </a>
                        <a href="!#" onClick={() => navigator.clipboard.writeText(this.state.username)}>
                            <i className="far fa-copy"></i></a>
                    </div>
                    <a href="!#" className="logout-Btn" onClick={this.logout}><i className="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        );
    }

    closeProfile = () => {
        return (
            <div>
                <a href="!#" onClick={this.switchState} ref={node => this.node = node}>
                    {this.state.icon}
                </a>
                <p ref={this.container}></p>
            </div>
        );
    }

}

interface loginProps {
    changeStatus: (bool) => void;
}

interface loginState {
    email: string;
    status: string;
}

export class Login extends Component<loginProps, loginState> {
    state = {
        email: "",
        status: ""
    };

    constructor(props) {
        super(props);

        this.handleEmail = this.handleEmail.bind(this);
        this.loginAndMain = this.loginAndMain.bind(this);
        this.handleOAuth = this.handleOAuth.bind(this);
    }

    render() {
        return (
            <div className="login">
                <div className="login-Box">
                    <h1>WALLETTE</h1>
                    <p>Please login</p>
                    <input type="text" className="user-email" placeholder="Enter your email" value={this.state.email}
                        onChange={this.handleEmail} />
                    <a href="!#" className="log-1" onClick={this.loginAndMain}>Login</a>
                    <button className= "oAuth" onClick={this.handleOAuth}><i className="fab fa-google"></i> Login with Google</button>
                </div>
            </div>
        );
    }

    handleOAuth = async () => {
        await magic.oauth.loginWithRedirect({
            provider: 'google',
            redirectURI: 'http://localhost:3000/',
        });

        this.props.changeStatus(await magic.user.isLoggedIn());

    }

    handleEmail = (event) => {
        this.setState({
            email: event.target.value
        });
    }

    loginAndMain = async () => {
        const email = this.state.email;

        await magic.auth.loginWithMagicLink({ email })
            .catch((err) => (
                this.setState({
                    status: "Incorrect Login"
                })
            ));


        this.props.changeStatus(await magic.user.isLoggedIn());
    }
}
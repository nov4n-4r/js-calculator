class App extends React.Component {
            
    constructor(props){
        super(props)
        this.state = this.initState()
        this.handleSubmit = this.handleSubmit.bind(this)
        this.inputNumber = this.inputNumber.bind(this)
        this.inputDecimal = this.inputDecimal.bind(this)
        this.inputOperator = this.inputOperator.bind(this)
        this.clearInput = this.clearInput.bind(this)
        this.isOperating = this.isOperating.bind(this)
        this.isInputNumber = this.isInputNumber.bind(this)
        this.isDecimal = this.isDecimal.bind(this)
        this.isMinus = this.isMinus.bind(this)
        this.reSanitizeNumber = this.reSanitizeNumber.bind(this)
        this.sanitizeQuery = this.sanitizeQuery.bind(this)
        this.sanitizeNumber = this.sanitizeNumber.bind(this)
    }

    isMinus(){return this.state.state === 3}
    isDecimal(){return this.state.state === 2}
    isOperating(){return this.state.state === 1}
    isInputNumber(){return this.state.state === 0}

    initState(currentInput = "0", input = [], state = 0){               // initial state
        return {
            input : input,
            currentInput : currentInput,
            state : state,                                  // 0 for initial (first loaded or clear button pressed) and input number, 
                                                            // 1 when inputting operator
                                                            // 2 for decimal
                                                            // 3 for minus state (inputing <0 number)
            history : []
        }
    }

    isFloat(number){
        return number % 1 !== 0
    }

    sanitizeQuery(string){  //  function for sanitizing eval query
        
        const backwardSymbolPattern=/(\D+)$/gm                 // 123+5-4+ the (+) in the backward is illegal
        const frontwardSymbolPattern=/^([^\-0-9])/gm                 // 123+5-4+ the (+) in the backward is illegal
        const unallowedCharPattern=/[^0-9+*\/.-\s]/g             // only number and operation symbol that allowed in program
        
        string = string
            .replace(backwardSymbolPattern, "")
            .replace(frontwardSymbolPattern, "")
            .replace(unallowedCharPattern, "")
        return string
    }

    sanitizeNumber(number){ //  function for sanitizing number

        const onlyZeroPattern = /^0$/   // if there is only 0 is allowed
        const decimalZero = /^(0\.)\d+$/g    // example 0.xxx
        if(onlyZeroPattern.test(number) || decimalZero.test(number)) return number

        const unallowedCharPattern = /[^0-9.-]/
        const zeroPattern =/^0+/g       // zero number in the front is not allowed (000243)

        number = number
                .replace(zeroPattern, "")
                .replace(unallowedCharPattern, "")

        return number
    }

    reSanitizeNumber(number){
        const unExpectedDecimal = /\.$/ 
        this.sanitizeNumber(number)
            .replace(unExpectedDecimal, "")
        return number
    }

    handleSubmit(e){    // function triggered when equals "=" button clicked
        e.preventDefault()
        let self = this
        this.setState( prevState => {
            let {currentInput, input} = prevState
            let result = [...input, currentInput].map(number => self.reSanitizeNumber(number.toString()))
                result = result.join(" ")
                console.log(result)
                result = this.sanitizeQuery(result)
                console.log(result)
            const newState = this.initState(
                eval(result)
            )
            newState.history = [...input, currentInput]
            return newState
        } )
        console.log(this.state)                
    }

    inputDecimal(e){
        let input = e.target.value
        this.setState( prevState => {
            let newState = {}
            if(this.isDecimal()) return prevState
            if(this.isInputNumber()) newState.currentInput = prevState.currentInput + "."
            if(this.isOperating()){
                newState = this.initState("0.", [...prevState.input, prevState.currentInput])
            }
            newState.state = 2
            return newState
        } )
        // console.log(this.state)                
    }
    
    inputNumber(e){     // function triggered when number "0-9" button clicked
        let input = e.target.value
        this.setState( prevState => {
            let newState = {}
            if(this.isInputNumber() || this.isDecimal() || this.isMinus()){
                if(input === "0" && prevState.currentInput === "0") input = ""
                if(this.isMinus && typeof(prevState.tmpVal) !== "undefined") newState.input = [...prevState.input, prevState.tmpVal]
                newState.currentInput = (this.isDecimal()) ? 
                    prevState.currentInput + input : 
                    this.sanitizeNumber(prevState.currentInput + input)
            }else{  // executed when inputing number after inputing operator
                    newState = this.initState( input, [...prevState.input, prevState.currentInput] )
            }
            return newState
        } )
        // console.log(this.state)                
    }

    inputOperator(e){   // function triggered when operation "-+*/" button clicked
        const input = e.target.value
        this.setState( prevState => {
            let newState = {}
            if(this.isOperating()){
                newState.currentInput = input
                if(input === "-" && prevState.currentInput !== "+") {
                    newState = this.initState(input, [...prevState.input], 3)
                    newState.tmpVal = prevState.currentInput
                }
            }else if(this.isMinus()){
                newState.currentInput = input
                newState.tmpVal = undefined
                newState.state = 1
            }else{
                (prevState.currentInput === "0") ?
                    newState = this.initState(input, [...prevState.input], 0) : 
                    newState = this.initState( input, [...prevState.input, prevState.currentInput], 1 )
            }
            return newState
        } )
        // console.log(this.state)                
    }

    clearInput(){       // functionn triggered when clear "AC" button clicked
        this.setState(this.initState())
    }
    
    render(){
        const {currentInput,state} = this.state
        return(<div id="wrapper" className="d-flex justify-content-center">
            <form className="bg-dark px-3 py-2" onSubmit={this.handleSubmit}>
            <div className="col" style={{width:"160px"}}>
                <div className="row">
                    <input readOnly id="display" type="text" onChange={this.handleChange} value={currentInput} className="border-0 col bg-dark text-light" />
                </div>
                <div className="row">
                    <input type="button" onClick={this.clearInput} id="clear" className="col-6 btn btn-input rounded-0 bg-danger" value="AC"/>
                    <input type="button" onClick={this.inputOperator} id="divide" className="col-3 btn btn-input rounded-0 bg-dark text-light" value="/" />
                    <button type="button" onClick={this.inputOperator} id="multiply" className="col-3 btn btn-input rounded-0 bg-dark text-light" value="*">x</button>
                </div>
                <div className="row">
                    <input type="button" onClick={this.inputNumber} id="one" className="col-3 btn btn-input rounded-0 bg-dark text-light" value="1" />
                    <input type="button" onClick={this.inputNumber} id="two" className="col-3 btn btn-input rounded-0 bg-dark text-light" value="2" />
                    <input type="button" onClick={this.inputNumber} id="three" className="col-3 btn btn-input rounded-0 bg-dark text-light" value="3" />
                    <input type="button" onClick={this.inputOperator} id="subtract" className="col-3 btn btn-input rounded-0 bg-dark text-light" value="-" />
                </div>
                <div className="row">
                    <input type="button" onClick={this.inputNumber} id="four" className="col-3 btn btn-input rounded-0 bg-dark text-light" value="4" />
                    <input type="button" onClick={this.inputNumber} id="five" className="col-3 btn btn-input rounded-0 bg-dark text-light" value="5" />
                    <input type="button" onClick={this.inputNumber} id="six" className="col-3 btn btn-input rounded-0 bg-dark text-light" value="6" />
                    <input type="button" onClick={this.inputOperator} id="add" className="col-3 btn btn-input rounded-0 bg-dark text-light" value="+" />
                </div>
                <div className="row">
                    <div className="col-9">
                        <div className="row">
                            <input type="button" onClick={this.inputNumber} id="seven" className="col-4 btn btn-input rounded-0 bg-dark text-light" value="7" />
                            <input type="button" onClick={this.inputNumber} id="eight" className="col-4 btn btn-input rounded-0 bg-dark text-light" value="8" />
                            <input type="button" onClick={this.inputNumber} id="nine" className="col-4 btn btn-input rounded-0 bg-dark text-light" value="9" />
                        </div>
                        <div className="row">
                            <input type="button" onClick={this.inputNumber} id="zero" className="col-8 btn btn-input rounded-0 bg-dark text-light" value="0" />
                            <input type="button" onClick={this.inputDecimal} id="decimal" className="col-4 btn btn-input rounded-0 bg-dark text-light" value="." />
                        </div>
                    </div>
                    <input type="submit" id="equals" className="col-3 btn rounded-0 bg-dark text-light" value="=" />
                </div>
            </div>
            </form>
        </div>
        )
    }
}
const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<App />)
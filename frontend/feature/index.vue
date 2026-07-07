<form id="login-form" novalidate>
  <h1>Log in</h1>

  <div class="field">
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      name="email"
      autocomplete="email"
      required
    />
    <span class="error" id="email-error" role="alert"></span>
  </div>

  <div class="field">
    <label for="password">Password</label>
    <input
      type="password"
      id="password"
      name="password"
      autocomplete="current-password"
      required
      minlength="8"
    />
    <span class="error" id="password-error" role="alert"></span>
  </div>

  <label class="checkbox">
    <input type="checkbox" id="remember" name="remember" />
    Remember me
  </label>

  <button type="submit" id="submit-btn">Log in</button>

  <p class="form-error" id="form-error" role="alert"></p>
</form>